import { I_Blueprint } from "../../../interfaces/I_Blueprint"
export const techBlueprint: I_Blueprint = {
  _id: "tech",
  order: 240,
  namePlural: "Sciences/Technological groups",
  nameSingular: "Science/Technological group",
  icon: "fas fa-wrench",
  category: "Groups/Teachings",
  extraFields: [
    {
      id: "leaders",
      name: "Leading figures (legacy)",
      type: "manyToNoneRelationship",
      icon: "mdi-crown",
      tooltip: `
        This field is obsolete and no longer serves any purpose.
        <br>
        Pleae move your data to the corresponding new fields.
        <br>
        This field will automatically disappear once all data is gone from it.
      `,
      isLegacy: true,
      sizing: 12,
      relationshipSettings: {
        connectedObjectType: "characters"
      }
    },
    {
      id: "pairedCharacter",
      name: "Technology/Science Users",
      type: "manyToManyRelationship",
      icon: "mdi-account",
      sizing: 12,
      tooltip: `
        This field is obsolete and no longer serves any purpose.
        <br>
        Pleae move your data to the corresponding new fields.
        <br>
        This field will automatically disappear once all data is gone from it.
      `,
      isLegacy: true,
      relationshipSettings: {
        connectedObjectType: "characters",
        connectedField: "pairedTech"
      }
    },
    {
      id: "breakDocumentSettings",
      name: "Document settings",
      type: "break",
      sizing: 12
    },
    {
      id: "name",
      name: "Name",
      type: "text",
      icon: "fas fa-wrench",
      sizing: 3
    },
    {
      id: "parentDoc",
      name: "Belongs under",
      type: "singleToNoneRelationship",
      tooltip:
        `This field is used to build up custom hierarchical tree structure in the main list of items in the left side of the app.
        <br> You can use this for an infinite amount of sub-levels to the hierarchical structure.
        <br> An example would be multiple sub-groups (provinces) of Roman Empire belonging under the main political group called "Roman Empire".
        `,
      sizing: 3,
      relationshipSettings: {
        connectedObjectType: "tech"
      }
    },
    {
      id: "documentColor",
      name: "Text color",
      type: "colorPicker",
      icon: "mdi-eyedropper",
      tooltip:
        `This field allows for custom-coloring your document to any available HEX or RBG color.
        <br>The selected color will show on the icon and name of the document both in the hierarchical tree on the left and in the top tabs.
        `,
      sizing: 2
    },
    {
      id: "documentBackgroundColor",
      name: "Background color",
      type: "colorPicker",
      icon: "mdi-format-color-fill",
      tooltip:
        `This field allows for custom-coloring your document to any available HEX or RBG color.
        <br>The selected color will show as a background both in the hierarchical tree on the left and in the top tabs.
        `,
      sizing: 2
    },
    {
      id: "finishedSwitch",
      name: "Is finished",
      type: "switch",
      icon: "mdi-check-bold",
      tooltip:
        `This setting allows for setting the current document to finished document mode.
        <br>
        A document with finished document mode toggled on will not show any un-filled fields in view mode and will function as if "Hide empty fields" was turned on in the settings.
        `,
      sizing: 2
    },
    {
      id: "minorSwitch",
      name: "Is a minor document",
      type: "switch",
      icon: "mdi-magnify-minus-outline",
      tooltip:
        `This setting allows for setting the current document to minor document mode.
        <br>
        A document with minor document mode toggled on will not show in any other relationship searches.<br>
        The idea behind this setting is to allow for creation of documents that will not clutter the search, but could be theoretically relevant in some very specific cases to the story (eg: distant relatives of a character).
        `,
      sizing: 3
    },
    {
      id: "deadSwitch",
      name: "Is Dead/Gone/Destroyed",
      type: "switch",
      icon: "mdi-skull-crossbones",
      tooltip:
        `This setting allows for setting the current document to dead/gone/destroyed mode.
        <br>
        A document with dead/gone/destroyed mode toggled on will have a crossed-over text modifier applied to it - showing that it is no longer a part of the current timeline.
        `,
      sizing: 3
    },
    {
      id: "categorySwitch",
      name: "Is a category",
      type: "switch",
      icon: "fas fa-folder-open",
      tooltip:
        `This setting allows for setting the current document to category mode.
        <br>
        A document with category mode toggled on will have most of its fields hidden and will not show in any other relationship searches except for "Belongs under".
        `,
      sizing: 3
    },
    {
      id: "order",
      name: "Order number",
      type: "number",
      icon: "mdi-file-tree",
      tooltip:
        `In case the default sorting via alphabet in the hierarchical tree on the left is inadequate for your needs, this field allows you to fill custom numbers to order by that get placed before the default alphabetical order.
        <br>It is heavily suggested to "pad-out" the custom order numbers by writing for example 100 (or least 10) instead of 1.
        <br>This allows for extra "padding" between the items in case a new one needs to be added in the middle without needing to redo the custom order on all documents.
        `,
      sizing: 3
    },
    {
      id: "tags",
      name: "Tags",
      type: "tags",
      icon: "mdi-tag",
      tooltip:
        `Tags are used to sort the same (or even different) document types into a custom groups based on your needs.
        <br>
        A document may have any number of tags, but each tag can be present only once.
        <br>
        This limitation also applies to any variation of lower or upper case iterations of the same tag.
        <br>
        Example: A tag called "Player Party" will be considered the same tag as "player party", "PlAyER PaRtY" or anything similar.
        `,
      sizing: 8
    },
    {
      id: "docTemplate",
      name: "Document Template",
      type: "documentTemplate",
      icon: "mdi-script-text-outline",
      tooltip:
        `
        Document templates are used to determine which fields will the current
        <br>
        document show both in view and edit mode.
        <br>
        Due to current technical limitations, new templates can be added and existing can
        <br>
        be edited/deleted only from the "Export project/document" popup.
        <br>
        Please also note that the updates to the template need a document tab reload.
        <br>
        This can be achieved either by closing an opening the current tab or switching
        <br>
        to another one and then back to this one.
        `,
      sizing: 4
    },
    {
      id: "extraClasses",
      name: "Extra HTML classes",
      type: "text",
      icon: "mdi-language-css3",
      tooltip:
        `This field exists for advanced usage by power-users who wish to style their document with globally defined CSS classes.
        <br>
        Settings are found inside "Project->Advanced project tools->Custom CSS".
        `,
      sizing: 12
    },
    {
      id: "otherNames",
      name: "Other names & Epithets",
      type: "list",
      icon: "mdi-book-plus",
      sizing: 12
    },
    {
      id: "categoryDescription",
      name: "Category description",
      type: "wysiwyg",
      icon: "mdi-folder-edit-outline",
      sizing: 12
    },
    {
      id: "breakBasic",
      name: "Basic information",
      type: "break",
      sizing: 12
    },

    {
      id: "succedingTechGroup",
      name: "Succeeding Sciences/Technological groups",
      type: "manyToManyRelationship",
      icon: "fas fa-wrench",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "tech",
        connectedField: "preceedingTechGroup"
      }
    },
    {
      id: "preceedingTechGroup",
      name: "Preceding Sciences/Technological groups",
      type: "manyToManyRelationship",
      icon: "fas fa-wrench",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "tech",
        connectedField: "succedingTechGroup"
      }
    },
    {
      id: "creationTime",
      name: "Date of creation",
      type: "text",
      icon: "mdi-timer-sand-empty",
      sizing: 2
    },
    {
      id: "endTIme",
      name: "Date of end",
      type: "text",
      icon: "mdi-timer-sand-full",
      sizing: 2
    },

    {
      id: "headquarters",
      name: "Headquarters",
      type: "singleToNoneRelationship",
      icon: "mdi-map-marker-radius",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "locations"
      }
    },
    {
      id: "followerName",
      name: "Name for members/followers",
      type: "text",
      icon: "fas fa-file-signature",
      sizing: 3
    },
    {
      id: "population",
      name: "Member/User count",
      type: "text",
      icon: "mdi-account-group",
      sizing: 2,
      tooltip: "The amount of members of this scientific school/teaching."
    },
    {
      id: "followers",
      name: "Follower/Subject count",
      type: "text",
      icon: "mdi-account-group-outline",
      sizing: 3,
      tooltip: "The amount of people affected by/following this scientific school/teaching."
    },

    {
      id: "leadingCharacters",
      name: "Leading Figures",
      type: "manyToManyRelationship",
      icon: "mdi-account",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "characters",
        connectedField: "leadingTechLeaders"
      }
    },
    {
      id: "typeTech",
      name: "Type",
      type: "multiSelect",
      icon: "fas fa-cogs",
      sizing: 3,
      predefinedSelectValues: [
        "Factory/Manufacture",
        "Invention",
        "Machinery",
        "Magi-tech creation",
        "School of technology",
        "Scientific/Technological institution",
        "Technique",
        "Other"
      ]
    },
    {
      id: "formTech",
      name: "Scientific branches",
      type: "multiSelect",
      icon: "fas fa-vial",
      sizing: 3,
      predefinedSelectValues: [
        "Agricultural science",
        "Astrology",
        "Automation & Applied logic",
        "Biology",
        "Chemistry",
        "Economics",
        "Engineering",
        "Geology",
        "History",
        "Linguistics",
        "Logic",
        "Magicology",
        "Mathematics",
        "Medicine",
        "Pedagogy",
        "Physics",
        "Politology",
        "Psychology",
        "Sociology",
        "Statistics",
        "Other"
      ]
    },
    {
      id: "pairedTech",
      name: "Related Technologies/Sciences",
      type: "manyToManyRelationship",
      icon: "fas fa-wrench",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "tech",
        connectedField: "pairedTech"
      }
    },
    {
      id: "pairedSkills",
      name: "Connected to Skills/Spells/Other",
      type: "manyToManyRelationship",
      icon: "mdi-sword-cross",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "skills",
        connectedField: "pairedTechGroupsSkills"
      }
    },
    {
      id: "pairedConditions",
      name: "Connected to Afflictions/Boons/Conditions",
      type: "manyToManyRelationship",
      icon: "mdi-virus",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "conditions",
        connectedField: "pairedTechGroups"
      }
    },
    {
      id: "pairedConnectedResources",
      name: "Important Resources/Materials",
      type: "manyToManyRelationship",
      icon: "mdi-gold",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "resources",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "connectedRaces",
      name: "Common Species/Races/Flora/Fauna",
      type: "manyToManyRelationship",
      icon: "fas fa-dragon",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "races",
        connectedField: "commonInTechGroups"
      }
    },
    {
      id: "localLanguages",
      name: "Common languages",
      type: "manyToManyRelationship",
      icon: "mdi-book-alphabet",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "languages",
        connectedField: "usedInTechGroups"
      }
    },
    {
      id: "description",
      name: "Description & History",
      type: "wysiwyg",
      icon: "mdi-book-open-page-variant-outline",
      sizing: 12
    },
    {
      id: "traditions",
      name: "Traditions & Customs",
      type: "wysiwyg",
      icon: "mdi-book-open-page-variant-outline",
      sizing: 12
    },
    {
      id: "breakNotes",
      name: "Connections - Story/Lore",
      type: "break",
      sizing: 12
    },
    {
      id: "pairedConnectedNotes",
      name: "Connected to Lore notes/Other notes",
      type: "manyToManyRelationship",
      icon: "mdi-script-text-outline",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "loreNotes",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedConnectedMyths",
      name: "Connected to Myths, legends and stories",
      type: "manyToManyRelationship",
      icon: "fas fa-journal-whills",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "myths",
        connectedField: "pairedConnectedTechGroups"
      }
    },

    {
      id: "breakWorld",
      name: "Connections - World",
      type: "break",
      sizing: 12
    },

    {
      id: "governLocations",
      name: "Ruled/Influenced Locations",
      type: "manyToManyRelationship",
      icon: "mdi-map-marker-radius",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "locations",
        connectedField: "governTech"
      }
    },
    {
      id: "connectedLocations",
      name: "Connected Locations",
      type: "manyToManyRelationship",
      icon: "mdi-map-marker-radius",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "locations",
        connectedField: "connectedTech"
      }
    },
    {
      id: "connectedEvents",
      name: "Connected Events",
      type: "manyToManyRelationship",
      icon: "mdi-calendar-text",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "events",
        connectedField: "connectedTech"
      }
    },
    {
      id: "pairedConnectedCultures",
      name: "Connected to Cultures/Art",
      type: "manyToManyRelationship",
      icon: "fas fa-archway",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "culture",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedConnectionCharacter",
      name: "Connected Characters",
      type: "manyToManyRelationship",
      icon: "mdi-account",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "characters",
        connectedField: "pairedConnectionTechGroup"
      }
    },
    {
      id: "pairedBelongingCharacter",
      name: "Prominent Members",
      type: "manyToManyRelationship",
      icon: "mdi-account",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "characters",
        connectedField: "pairedBelongingTechGroup"
      }
    },
    {
      id: "pairedAllyCharacter",
      name: "Prominent Allies",
      type: "manyToManyRelationship",
      icon: "mdi-account",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "characters",
        connectedField: "pairedAllyTechGroup"
      }
    },
    {
      id: "pairedEnemyCharacter",
      name: "Prominent Enemies",
      type: "manyToManyRelationship",
      icon: "mdi-account",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "characters",
        connectedField: "pairedEnemyTechGroup"
      }
    },

    {
      id: "breakPolitics",
      name: "Connections - Groups/Teachings",
      type: "break",
      sizing: 12
    },
    {
      id: "pairedConnectedPolGroups",
      name: "Connected Ideologies/Political groups",
      type: "manyToManyRelationship",
      icon: "mdi-bank-outline",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "politicalGroups",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedAllyPolGroups",
      name: "Allied Ideologies/Political groups",
      type: "manyToManyRelationship",
      icon: "mdi-bank-outline",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "politicalGroups",
        connectedField: "pairedAllyTechGroups"
      }
    },
    {
      id: "pairedEnemyPolGroups",
      name: "Enemy Ideologies/Political groups",
      type: "manyToManyRelationship",
      icon: "mdi-bank-outline",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "politicalGroups",
        connectedField: "pairedEnemyTechGroups"
      }
    },
    {
      id: "pairedConnectedOtherGroups",
      name: "Connected Organizations/Other groups",
      type: "manyToManyRelationship",
      icon: "mdi-account-group",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "guilds",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedAllyOtherGroups",
      name: "Allied Organizations/Other groups",
      type: "manyToManyRelationship",
      icon: "mdi-account-group",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "guilds",
        connectedField: "pairedAllyTechGroups"
      }
    },
    {
      id: "pairedEnemyOtherGroups",
      name: "Enemy Organizations/Other groups",
      type: "manyToManyRelationship",
      icon: "mdi-account-group",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "guilds",
        connectedField: "pairedEnemyTechGroups"
      }
    },
    {
      id: "pairedConnectedReligiousGroups",
      name: "Connected Teachings/Religious groups",
      type: "manyToManyRelationship",
      icon: "fas fa-ankh",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "religions",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedAllyReligiousGroups",
      name: "Allied Teachings/Religious groups",
      type: "manyToManyRelationship",
      icon: "fas fa-ankh",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "religions",
        connectedField: "pairedAllyTechGroups"
      }
    },
    {
      id: "pairedEnemyReligiousGroups",
      name: "Enemy Teachings/Religious groups",
      type: "manyToManyRelationship",
      icon: "fas fa-ankh",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "religions",
        connectedField: "pairedEnemyTechGroups"
      }
    },
    {
      id: "pairedConnectedMagicalGroups",
      name: "Connected Schools of Magic/Magical groups",
      type: "manyToManyRelationship",
      icon: "fas fa-hat-wizard",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "magic",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedAllyMagicalGroups",
      name: "Allied Schools of Magic/Magical groups",
      type: "manyToManyRelationship",
      icon: "fas fa-hat-wizard",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "magic",
        connectedField: "pairedAllyTechGroups"
      }
    },
    {
      id: "pairedEnemyMagicalGroups",
      name: "Enemy Schools of Magic/Magical groups",
      type: "manyToManyRelationship",
      icon: "fas fa-hat-wizard",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "magic",
        connectedField: "pairedEnemyTechGroups"
      }
    },
    {
      id: "pairedConnectedTechGroups",
      name: "Connected Sciences/Technological groups",
      type: "manyToManyRelationship",
      icon: "fas fa-wrench",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "tech",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedAllyTechGroups",
      name: "Allied Sciences/Technological groups",
      type: "manyToManyRelationship",
      icon: "fas fa-wrench",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "tech",
        connectedField: "pairedAllyTechGroups"
      }
    },
    {
      id: "pairedEnemyTechGroups",
      name: "Enemy Sciences/Technological groups",
      type: "manyToManyRelationship",
      icon: "fas fa-wrench",
      sizing: 4,
      relationshipSettings: {
        connectedObjectType: "tech",
        connectedField: "pairedEnemyTechGroups"
      }
    },
    {
      id: "breakDetails",
      name: "Connections - Details",
      type: "break",
      sizing: 12
    },
    {
      id: "pairedConnectedItems",
      name: "Connected to Items",
      type: "manyToManyRelationship",
      icon: "mdi-sword",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "items",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "pairedConnectedProfessions",
      name: "Connected to Occupations/Classes",
      type: "manyToManyRelationship",
      icon: "fab fa-pied-piper-hat",
      sizing: 6,
      relationshipSettings: {
        connectedObjectType: "professions",
        connectedField: "pairedConnectedTechGroups"
      }
    },
    {
      id: "breakSpoilers",
      name: "Secrets/Spoilers/DM notes",
      type: "break",
      sizing: 12,
      isSpoiler: true
    },
    {
      id: "spoilerNotes",
      name: "Secrets/Spoilers/DM notes",
      type: "wysiwyg",
      icon: "fas fa-mask",
      sizing: 12,
      isSpoiler: true,
      tooltip:
        `This field will not export by default when using the Export document functionality.
        <br>
        Instead it needs to be manually included if the user wishes to export it.
        `
    }
  ]
}
