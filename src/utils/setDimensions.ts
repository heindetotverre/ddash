import { nextTick } from "vue"
import { DimensionChangePayload } from '@/types/types'

const width = 300

const setDimensionsUtil = async (dimensionsPayload: DimensionChangePayload
): Promise<void> => {
  const setHeight = () => {
    dimensionsPayload.animateElement.style.height = typeof dimensionsPayload.value === 'number' ? dimensionsPayload.value + 'px' : dimensionsPayload.contentElement.clientHeight + 'px'
  }

  const setWidth = () => {
    dimensionsPayload.animateElement.style.width = typeof dimensionsPayload.value === 'number' ? dimensionsPayload.value + 'px' : width + 'px'
  }

  const setBoth = () => {
    setHeight()
    setWidth()
  }

  await nextTick()
  dimensionsPayload.editDimension === 'height'
    ? setHeight()
    : dimensionsPayload.editDimension === 'width'
      ? setWidth()
      : setBoth()
}

export { setDimensionsUtil }