import React, { ReactElement } from 'react'
import ReactPlayer, { Config } from 'react-player'

export default function VideoPlayer({
  videoUrl,
  config
}: {
  videoUrl: string
  config?: Config
}): ReactElement {
  return <ReactPlayer url={videoUrl} controls pip width="100%" {...config} />
}
