import React, { ReactElement } from 'react'
import TagItem from './TagItem'
import styles from './TagsList.module.css'

export default function TagsList({
  title,
  tagsList,
  selectedTags,
  setSelectedTags
}: {
  title: string
  tagsList: string[]
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
}): ReactElement {
  const content = tagsList.map((tag, index) => (
    <TagItem
      key={index}
      name={tag}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
    />
  ))

  return (
    <>
      <span className={styles.titleGroup}>{title}</span>
      <div className={styles.networks}>{content}</div>
    </>
  )
}
