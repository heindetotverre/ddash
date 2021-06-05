interface List {
  listName: string,
  listContent: Array<ListContent>,
  listId: string
}

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
  description: string
}

interface FormButton {
  name: string,
  classes: string,
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

interface Form {
  name: string,
  fields: Array<FormField>,
  buttons: Array<FormButton>
}

export {
  List,
  CrawlData,
  ListContent,
  ListComponent,
  Form,
  FormEvent,
  FormEvaluationEvent
}