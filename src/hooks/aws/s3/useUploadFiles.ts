import {useState} from "react";
import S3Manager from "../../../utils/aws/s3Manager";

/**
 *
 * @param {number} pos
 * @param {File} file
 * @param {string} hash
 * @param {string} MIMEType
 * @param {string} storageType
 */
export interface UseUploadFilesParams {
  pos: number,
  file: File,
  hash: string,
  MIMEType: string,
  storageType: string
}

/**
 * @param {boolean} completed
 * @param {string} error
 * @param {{pos: number, perc: number}[]} uploadPerc
 */
export interface UseUploadFilesState {
  completed: boolean,
  error: string,
  uploadPerc: {pos: number, perc: number}[]
}

/**
 * @param {function} upload
 */
export interface UseUploadFilesResponse extends UseUploadFilesState {
  upload: (fileList: UseUploadFilesParams[]) => void
}

/**
 * Hook used to upload a file to S3
 *
 * The upload percentage for all the files is visible in the uploadPerc array
 */
export const useUploadFiles = (): UseUploadFilesResponse => {
  const [status, setStatus] = useState<UseUploadFilesState>({completed: false, error: "", uploadPerc: []});

  const upload = (fileList: UseUploadFilesParams[]): void => {

    new Promise( async (resolve, reject) => {
      // creates all the promises, one for each file
      for (let fi=0; fi<fileList.length; fi++) {
        let f = fileList[fi];
        let sourceFileUpload = await S3Manager.createS3ManagedUpload(
          "temporary-files-tproof-io",
          "0x" + f.hash,
          f.file,
          {"Content-Type": f.MIMEType, "sotrageType": f.storageType}  // TODO Content-Type should be a string in the format */*
        );
        sourceFileUpload.on("httpUploadProgress", (progress) => {
          // TODO re-enable the abort of uploads
          // if (shouldStopUpload()) { sourceFileUpload.abort(); }
          let tmpStatusUploadPerc = structuredClone(status.uploadPerc) as  {pos: number, perc: number}[];
          if (!tmpStatusUploadPerc[fi]) tmpStatusUploadPerc[fi] = {pos: fi, perc: 0}
          tmpStatusUploadPerc[fi].perc = Math.round(progress.loaded * 100 / progress.total);
          setStatus({
            ...status,
            uploadPerc: tmpStatusUploadPerc
          });
        });
        await sourceFileUpload.done();
      }
      setStatus({
        ...status,
        completed: true
      })
    }).then(() => {});
  }

  return {
    ...status, upload
  };
}
