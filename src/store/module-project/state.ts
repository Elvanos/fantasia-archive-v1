export interface ProjectInterface {
  projectLoaded: boolean,
  projectName: string
  projectCustomCSS: string
}

function state (): ProjectInterface {
  return {
    projectLoaded: false,
    projectName: "",
    projectCustomCSS: ""
  }
}

export default state
