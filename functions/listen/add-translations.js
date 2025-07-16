// send text to speewchify api
// update media status: to 'translating'
// convert audio to mp3 and save it in media assets s3 bucket (get presigned url first: copy from nomadmethod)

// once s3 is saved, save the s3 key and save it in media-files table
// also store transcript in media-files table as well
// take the id and store it in media table as well as update the status

// once the transcript has been generated, start the translation pipeline
// set the status to translating-transcript
// once the trascript has been translated, set the status to 'transcript-translated'
// Done

// 1.
