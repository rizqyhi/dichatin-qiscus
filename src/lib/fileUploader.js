import { scrollIntoLastElement } from './utils';

export const uploadFile = (e, core, toasted) => {
  const files = e.target.files || e.dataTransfer.files;
  const formData = new FormData();
  const roomId = core.selected.id;

  // check allowed file type
  // ambil dulu extensi file nya sebelumnya.
  // console.log(files);
  let ext = files[0].name.split('.');
  ext = ext[ext.length - 1] || null;
  if (core.allowedFileTypes && core.allowedFileTypes.indexOf(ext) < 0) {
    return toasted.error('File uploading failed');
  }

  // all clear, let's upload
  formData.append('file', files[0]);
  formData.append('token', core.userData.token);
  core.addUploadedFile(files[0].name, roomId);
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (uploadEvent) => {
    updateProgress(uploadEvent, files[0].name, core);
  });
  xhr.open('POST', `${core.baseURL}/api/v2/sdk/upload`, true);
  xhr.setRequestHeader('qiscus_sdk_app_id', `${core.AppId}`);
  xhr.setRequestHeader('qiscus_sdk_user_id', `${core.user_id}`);
  xhr.setRequestHeader('qiscus_sdk_token', `${core.userData.token}`);
  xhr.onload = function responseReceived() {
    if (xhr.status === 200) {
      // file(s) uploaded), let's post to comment
      const url = JSON.parse(xhr.response).results.file.url;
      const attachmentPayload = {
        url,
        caption: '',
        file_name: files[0].name,
      };
      core.sendComment(roomId, `[file] ${url} [/file]`, null,
      'file_attachment', JSON.stringify(attachmentPayload))
        .then(() => {
          core.removeUploadedFile(files[0].name, roomId);
          e.target.value = null;
          window.setTimeout(() => scrollIntoLastElement(core), 0);
        });
    } else {
      toasted.error('File uploading failed');
      core.removeUploadedFile(files[0].name, roomId);
    }
  };
  xhr.onerror = function() {
    toasted.error('File uploading failed');
    core.removeUploadedFile(files[0].name, roomId);
  }
  xhr.send(formData);
  return true;
}

export const updateProgress = (e, fileName, core) => {
  if (e.lengthComputable) {
    const percentComplete = e.loaded / e.total;
    const fileObject = uploadedFiles(core)
      .find(f => f.name === fileName);
    if (fileObject) fileObject.progress = Math.round(percentComplete * 100);
    // console.log('%s', fileObject.progress);
  } else {
    console.log('unknown');
  }
}

export const uploadedFiles = (core) => {
  if (!core.selected) return [];
  return core.uploadedFiles
    .filter(f => f.roomId === core.selected.id);
}