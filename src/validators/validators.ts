const validators = (validatorName: string, fieldData: string): boolean => {
  const notempty = (fieldData: string) => {
    return !!fieldData
  }

  const names = (fieldData: string) => {
    return /^[a-z ,.'-]+$/i.test(fieldData) && !!fieldData
  }

  const email = (fieldData: string) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(fieldData)
  }

  const password = (fieldData: string) => {
    return !!fieldData
  }

  return validatorName === 'notempty'
    ? notempty(fieldData)
    : validatorName === 'names'
      ? names(fieldData)
      : validatorName === 'email'
        ? email(fieldData)
        : validatorName === 'password'
          ? password(fieldData)
          : notempty(fieldData)
}

export { validators }