import React, { ChangeEvent, ReactElement } from 'react'
import { removeItemFromArray } from '../../utils'
import styles from './TagItem.module.css'

export default function TagItem({
  name,
  selectedTags,
  setSelectedTags
}: {
  name: string
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
}): ReactElement {
  function handleTagSelection(e: ChangeEvent<HTMLInputElement>) {
    const { checked, name } = e.target
    if (!checked) {
      setSelectedTags([...removeItemFromArray(selectedTags, name)])
    } else {
      setSelectedTags([...selectedTags, name])
    }
  }

  return (
    <div className={styles.radioWrap}>
      <label className={styles.radioLabel}>
        <input
          className={styles.input}
          type="checkbox"
          name={name}
          onChange={handleTagSelection}
          defaultChecked={selectedTags.includes(name)}
        />
        <span className={styles.name}>{name}</span>
      </label>
    </div>
  )
}
