import React, { ReactElement } from 'react'
import Input, { InputProps } from '../..'
import { Field, useField } from 'formik'
import { AlgorithmConsumerParameter } from '@components/Publish/_types'

export default function DefaultInput({
  index,
  fieldName,
  ...props
}: InputProps & {
  index: number
  fieldName: string
}): ReactElement {
  const [field] = useField<AlgorithmConsumerParameter[]>(fieldName)

  const getStringOptions = (options: { [key: string]: string }[]): string[] => {
    if (!options?.length) return []

    return options.map((option) => Object.keys(option)[0])
  }

  return (
    <Field
      {...props}
      required={field.value[index].required === 'required'}
      component={Input}
      name={`${field.name}[${index}].${props.name}`}
      type={
        field.value[index].type === 'boolean'
          ? 'select'
          : field.value[index].type
      }
      options={
        field.value[index].type === 'boolean'
          ? ['true', 'false']
          : field.value[index].type === 'select'
          ? getStringOptions(
              field.value[index]?.options as {
                [key: string]: string
              }[]
            )
          : field.value[index].options
      }
    />
  )
}
