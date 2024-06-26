export interface I_ExportObject{
  id: string
  name: string
  documentType: string
  documentDirectory: string
  isCategory: boolean
  isDead?: boolean,
  hierarchicalPath?: string
  tags?: string[]
  fieldValues: {
    label: string,
    type: string
    id: string
    value?: string | string[]
  }[]
}
