interface CrawlData {
  name: string,
  url: string,
  searchParams: {
    listSelector: string,
    itemSelector: string,
    titleSelector: string,
    linkSelector: string,
    cookieWallAcceptSelector: string
  }
}

interface List {
  listName: string,
  listContent: Array<ListContent>,
  listId: string
}

interface ListContent {
  link: string,
  title: string
}

interface ListComponent {
  id: string,
  component: string
}

interface FormEvent {
  field: string,
  value: string
}

interface FormField {
  name: string,
  label: string,
  component: string,
  type: string,
  description: string,
  required: boolean,
  validator: string,
  disabled: boolean
}

interface FormButton {
  name: string,
  classes?: string,
  text: string,
  component: string
}

interface FormEvaluationEvent {
  validationStatus: boolean,
  formValues: {
    itemSelector: string,
    linkSelector: string,
    listSelector: string,
    titleSelector: string,
    listUrl: string,
    listName: string,
    cookieWallAcceptSelector: string
  }
}

interface FormObject {
  name: string,
  fields: Array<FormField>,
  buttons?: Array<FormButton>,
  icons?: Array<IconsContent>
}

interface FormFieldUpdate {
  fieldName: string,
  fieldKey: string,
  fieldValue: string
}

interface ValidationResult {
  fieldName: string,
  error: boolean
}

interface IconsContent {
  iconName: string,
  class?: string,
  function?: string,
  iconType?: string,
  image: string,
  text?: string
}

interface IconGroup {
  name: string,
  iconList: Array<IconsContent>
}

interface LoginResult {
  status: string
}

export {
  List,
  CrawlData,
  ListContent,
  ListComponent,
  FormObject,
  FormEvent,
  FormEvaluationEvent,
  FormField,
  FormFieldUpdate,
  ValidationResult,
  IconsContent,
  IconGroup,
  LoginResult
}