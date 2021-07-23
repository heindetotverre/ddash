import { nextTick } from "vue"

const maxHeight = 800
const width = 300

const setDimensions = async (
  editDimension: string,
  animateElement: HTMLElement,
  contentElement: HTMLElement,
  data: number | void
): Promise<void> => {
  await nextTick()
  if (typeof data === 'number') {
    editDimension === 'height'
      ? animateElement.style.height = data + 'px'
      : animateElement.style.width = data + 'px'
  } else {
    editDimension === 'height'
      ? contentElement.clientHeight > maxHeight
        ? (animateElement.style.height = maxHeight + 'px')
        : (animateElement.style.height = contentElement.clientHeight + 'px')
      : (animateElement.style.width = width + 'px')
  }
}

export default { setDimensions }