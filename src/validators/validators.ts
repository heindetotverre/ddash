const validators = (validatorName: string, fieldData: string): boolean => {
  const notempty = (fieldData: string) => {
    return !!fieldData
  }

  return validatorName === 'notempty'
    ? notempty(fieldData)
    : false
}

export { validators }