import { remote } from "electron"
// @ts-ignore
import replicationStream from "pouchdb-replication-stream/dist/pouchdb.replication-stream.min.js"
// @ts-ignore
import load from "pouchdb-load"
import PouchDB from "pouchdb"
import fs from "fs"
import path from "path"
import { extend } from "quasar"

/**
   * Creates a brand new project and deleted any present data avaiable right now
   * @param projectName The name of the new project
   * @praram vueRouter The vue router object
   */
export const createNewProject = async (projectName: string, vueRouter: any, quasar: any, vueInstance: any) => {
  await removeCurrentProject()

  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }

  window.FA_dbs["project-data"] = new PouchDB("project-data")
  const newProject = {
    _id: "projectSetup",
    projectName: projectName,
    createdOnVersion: remote.app.getVersion()
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.FA_dbs["project-data"].put(newProject)

  /*eslint-disable */
  // @ts-ignore
  vueRouter.push({ path: "/" }).catch((e: { name: string }) => {
    const errorName: string = e.name
    if (errorName === "NavigationDuplicated") {
      return
    }
    console.log(e)
  })
  /* eslint-enable */

  await new Promise(resolve => setTimeout(resolve, 1000))

  /*eslint-disable */
  // @ts-ignore
  vueRouter.push({ path: "/project" }).catch((e: { name: string }) => {
    const errorName: string = e.name
    if (errorName === "NavigationDuplicated") {
      return
    }
    console.log(e)
  })

  quasar.notify({
    type: 'positive',
    message: `New project succesfully created`
  })
  vueInstance.SSET_resetDocuments()
  vueInstance.SSET_resetAllDocuments()
  /* eslint-enable */
}

/**
   * Open an file dialog asking the use for location where to export the project
   * @param projectName The name of the project to export
   */
export const saveProject = (projectName: string, Loading: any, loadingSetup: any, quasar: any) => {
  remote.dialog.showOpenDialog({
    properties: ["openDirectory"]
  }).then(async (result) => {
    /*eslint-disable */
    const folderPath = result.filePaths[0]

    if (!folderPath) {
      return
    }

    Loading.show(loadingSetup)

    PouchDB.plugin(replicationStream.plugin)
    // @ts-ignore
    PouchDB.adapter("writableStream", replicationStream.adapters.writableStream)

    // @ts-ignore
    const allDBS = await indexedDB.databases()

    const DBnames: string[] = allDBS
      .filter((d: { name: string }) => d.name !== '_pouch_fa-settings')
      .map((db: { name: string }) => {
        return db.name.replace("_pouch_", "")
      })

    for (const db of DBnames) {
      window.FA_dbs[db] = new PouchDB(db)

      if (!fs.existsSync(`${folderPath}`)) {
        fs.mkdirSync(`${folderPath}`)
      }

      // Check if this is a nested folder or not
      const isProjectFolder = fs.existsSync(`${folderPath}/project-data.txt`)
      const projectPath = (isProjectFolder)
        ? `${folderPath}`
        : `${folderPath}/${projectName}`

      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath)
      }
      const ws = fs.createWriteStream(`${projectPath}/${db}.txt`)

      // @ts-ignore
      await window.FA_dbs[db].dump(ws)

    }

    Loading.hide()
    quasar.notify({
      type: 'positive',
      message: `Project succesfully saved`
    })
    /* eslint-enable */
  }).catch(err => {
    console.log(err)
  })
}

/**
 * Delete the current project and all its data
 */
export const removeCurrentProject = async () => {
  /*eslint-disable */
  // @ts-ignore
  const allDBS = await indexedDB.databases()

  const DBnames: string[] = allDBS
    .filter((d: { name: string }) => d.name !== '_pouch_fa-settings')
    .map((db: { name: string }) => {
      return db.name.replace("_pouch_", "")
    })


  for (const db of DBnames) {
    window.FA_dbs[db] = new PouchDB(db)
    await window.FA_dbs[db].destroy()
  }
  /* eslint-enable */
}

/**
 * Opens a dialog to let user pick whatever project they wish to open and lets them select a directory
 * @param vueRouter The vue router object
 */
export const loadExistingProject = (vueRouter: any, Loading: any, loadingSetup: any, quasar: any, vueInstance: any) => {
  /*eslint-disable */
  remote.dialog.showOpenDialog({
    properties: ["openDirectory"]
  }).then(async (result) => {
    const folderPath = result.filePaths[0]

    if (!folderPath) {
      return
    }

    Loading.show(loadingSetup)

    await removeCurrentProject()

    // @ts-ignore
    PouchDB.plugin({
      loadIt: load.load
    })

    const allFiles = fs.readdirSync(folderPath)

    for (const file of allFiles) {
      const currentDBName = path.parse(file).name
      window.FA_dbs[currentDBName] = new PouchDB(currentDBName)

      const fileContents = fs.readFileSync(`${folderPath}/${file}`, { encoding: "utf8" })
      // @ts-ignore
      await window.FA_dbs[currentDBName].loadIt(fileContents)

    }

    const optionsSnapShot = extend(true, {}, vueInstance.SGET_options)
    // @ts-ignore
    optionsSnapShot.legacyFieldsCheck018 = true
    // @ts-ignore
    optionsSnapShot.pre017check = (await retrieveCurrentProjectVersion() < 0.017)

    // @ts-ignore
    vueInstance.SSET_options(optionsSnapShot)

    /*eslint-disable */
    // @ts-ignore
    vueRouter.push({ path: "/" }).catch((e: { name: string }) => {
      const errorName: string = e.name
      if (errorName === "NavigationDuplicated") {
        return
      }
      console.log(e)
    })
    /* eslint-enable */

    await new Promise(resolve => setTimeout(resolve, 1000))

    /*eslint-disable */
    // @ts-ignore
    vueRouter.push({ path: "/project" }).catch((e: { name: string }) => {
      const errorName: string = e.name
      if (errorName === "NavigationDuplicated") {
        return
      }
      console.log(e)
    })

    quasar.notify({
      type: 'positive',
      message: `Project succesfully loaded`
    })

    vueInstance.SSET_resetDocuments()
    vueInstance.SSET_resetAllDocuments()
    /* eslint-enable */
  }).catch(err => {
    console.log(err)
  })
  /* eslint-enable */
}

/**
 * Opens a dialog to let user pick whatever project they wish to open and lets them select a directory
 * @param vueRouter The vue router object
 */
export const mergeExistingProject = (vueRouter: any, Loading: any, loadingSetup: any, quasar: any, vueInstance: any) => {
  /*eslint-disable */
  remote.dialog.showOpenDialog({
    properties: ["openDirectory"]
  }).then(async (result) => {
    const folderPath = result.filePaths[0]

    if (!folderPath) {
      return
    }

    Loading.show(loadingSetup)

    // @ts-ignore
    PouchDB.plugin({
      loadIt: load.load
    })

    let allFiles = fs.readdirSync(folderPath)
    allFiles = allFiles.filter(file => file !== 'project-data.txt')

    for (const file of allFiles) {
      const currentDBName = path.parse(file).name
      window.FA_dbs[currentDBName] = new PouchDB(currentDBName)

      const fileContents = fs.readFileSync(`${folderPath}/${file}`, { encoding: "utf8" })
      // @ts-ignore
      await window.FA_dbs[currentDBName].loadIt(fileContents)
    }


    const optionsSnapShot = extend(true, {}, vueInstance.SGET_options)
    // @ts-ignore
    optionsSnapShot.legacyFieldsCheck018 = true
    // @ts-ignore
    optionsSnapShot.pre017check = (await retrieveCurrentProjectVersion() < 0.017)
    // @ts-ignore
    vueInstance.SSET_options(optionsSnapShot)

    /*eslint-disable */
    // @ts-ignore
    vueRouter.push({ path: "/" }).catch((e: { name: string }) => {
      const errorName: string = e.name
      if (errorName === "NavigationDuplicated") {
        return
      }
      console.log(e)
    })
    /* eslint-enable */

    await new Promise(resolve => setTimeout(resolve, 1000))

    /*eslint-disable */
    // @ts-ignore
    vueRouter.push({ path: "/project" }).catch((e: { name: string }) => {
      const errorName: string = e.name
      if (errorName === "NavigationDuplicated") {
        return
      }
      console.log(e)
    })

    quasar.notify({
      type: 'positive',
      message: `Data successfully merged into the project`
    })

    vueInstance.SSET_resetDocuments()
    vueInstance.SSET_resetAllDocuments()

    /* eslint-enable */
  }).catch(err => {
    console.log(err)
  })
  /* eslint-enable */
}

/**
 * Retrieves current project name
 */
export const retrieveCurrentProjectName = async () => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  const projectName: string = (projectData?.rows[0]?.doc?.projectName) || projectData?.rows[0]?.doc?._id

  return (projectName) || ""
}

/**
 * Retrieves current project name
 */
export const retrieveCurrentProjectVersion = async () => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  let projectVersion: string = (projectData?.rows[0]?.doc?.createdOnVersion)
  let projectVersionNumber = 0

  console.log(projectVersion)

  if (projectVersion) {
    projectVersion = projectVersion.replace(/\./g, "")
    console.log(projectVersion)
    projectVersion = projectVersion.slice(0, 1) + "." + projectVersion.slice(1)
    console.log(projectVersion)
    projectVersionNumber = Number(projectVersion)
  }

  return projectVersionNumber
}

/**
 * Retrieves current project custom CSS
 */
export const retrieveCurrentProjectCustomCSS = async () => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  const projectCustomCSS: string = projectData?.rows[0]?.doc?.projectCustomCSS

  return (projectCustomCSS) || ""
}

/**
 * Change current project name
 */
export const changeCurrentProjectSettings = async (input: {
  projectName?: string,
  createdOnVersion?: string
  projectCustomCSS?: string
}) => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  if (input.projectName) {
    projectData.rows[0].doc.projectName = input.projectName
  }

  if (input.projectCustomCSS) {
    projectData.rows[0].doc.projectCustomCSS = input.projectCustomCSS
  }

  if (input.createdOnVersion) {
    projectData.rows[0].doc.createdOnVersion = input.createdOnVersion
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await window.FA_dbs["project-data"].put(projectData.rows[0].doc)
}

/**
 * Save corkboard update
 */
export const saveCorkboard = async (input: string) => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  projectData.rows[0].doc.corkboardText = input.trim()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.FA_dbs["project-data"].put(projectData.rows[0].doc)
}

/**
 * Retrieve corkboard
 */
export const retrieveCorkboard = async (): Promise<string> => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (projectData.rows[0]?.doc.corkboardText) || ""
}

/**
 * Update last opened documents
 */
export const updateLastOpenedDocuments = async (newDocID: string) => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  if (!projectData.rows[0].doc.lastOpenedDocList) {
    projectData.rows[0].doc.lastOpenedDocList = []
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  projectData.rows[0].doc.lastOpenedDocList = [...new Set([
    newDocID,
    ...projectData.rows[0].doc.lastOpenedDocList
  ])].slice(0, 50)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.FA_dbs["project-data"].put(projectData.rows[0].doc).catch(() => console.log())
}

/**
 * Retrieve last opened document IDListr
 */
export const retrieveLastOpenedDocuments = async (): Promise<string[]> => {
  if (!window.FA_dbs) {
    // @ts-ignore
    window.FA_dbs = {}
  }
  window.FA_dbs["project-data"] = new PouchDB("project-data")
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const projectData = await window.FA_dbs["project-data"].allDocs({ include_docs: true })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (projectData.rows[0]?.doc?.lastOpenedDocList) || []
}
