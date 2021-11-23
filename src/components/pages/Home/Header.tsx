import React, { ReactElement } from 'react'
import styles from './Header.module.css'
import { ReactComponent as DataXChange } from '../../../images/dataxchange.svg'
import { ReactComponent as DeltadaoText } from '../../../images/deltaDAO_logo_text.svg'
import { graphql, useStaticQuery } from 'gatsby'

const contentQuery = graphql`
  query TaglineQuery {
    file(relativePath: { eq: "pages/home/intro.json" }) {
      childHomeJson {
        desc
        boxes {
          title
        }
      }
    }
  }
`

export default function Header(): ReactElement {
  const data = useStaticQuery(contentQuery)
  const { boxes, desc } = data.file.childHomeJson

  return (
    <div className={styles.container}>
      <DeltadaoText className={styles.logoText} />
      <DataXChange className={styles.dataXChange} />
      <h1 className={styles.tagLine}>
        {boxes.map((box: { title: string }, i: number) => (
          <span key={i}>
            {box.title}
            {i === boxes.length - 1 ? (
              ` ${desc}`
            ) : (
              <>
                ,
                <br />
              </>
            )}
          </span>
        ))}
      </h1>
    </div>
  )
}
