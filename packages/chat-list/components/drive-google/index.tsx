// import gapi from 'gapi';
import { LucideIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import Icon from 'chat-list/components/icon'
import { base64ToFile } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';

const mimeToExtensionMap: any = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/pdf': '.pdf',
    // 可以根据需要添加更多 MIME 类型和扩展名的映射
};

function getFileExtension(mimeType: string) {
    return mimeToExtensionMap[mimeType] || ''; // 如果 MIME 类型未映射，返回空字符串
}



const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '502322973058-jsd9j9eq7m6mfrgivtjoafdhk376pdg3.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBvIGsYWHAtvH2OXMwUt2Fnu5_wHTXmHNs';
const APP_ID = "502322973058";

let tokenClient: any;
let accessToken: any = null;
let pickerInited = false;
let gisInited = false;

let gapi: any;

interface IGoogleDrive {
    icon?: LucideIcon;
    config?: {
        maxSize?: number;
        maxFiles?: number;
        multiple?: boolean;
        accept?: {
            image: boolean;
            text: boolean;
            xlsx: boolean;
        };
    };
    onSelect?: (files: File[]) => void;
}


export default function index(props: IGoogleDrive) {
    const { onSelect } = props;
    const { platform } = useChatState();
    function gapiLoaded() {
        gapi.load('client:picker', initializePicker);
    }

    /**
     * Callback after the API client is loaded. Loads the
     * discovery doc to initialize the API.
     */
    async function initializePicker() {
        await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    }

    /**
 * Callback after Google Identity Services are loaded.
 */
    function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
    }

    /**
 *  Create and render a Picker object for searching images.
 */
    function createPicker() {
        const view = new google.picker.View(google.picker.ViewId.DOCS);
        // view.setMimeTypes('image/png,image/jpeg,image/jpg');
        const picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setDeveloperKey(API_KEY)
            .setAppId(APP_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }
    function getOAuthToken() {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler((result: any) => {
                    resolve(result);
                })
                .withFailureHandler((error: any) => {
                    reject(error);
                })
                .getOAuthToken();
        })
    }
    /**
     *  Sign in the user upon button click.
     */
    async function handleAuthClick() {
        // if (platform === 'chrome') {
        //     accessToken = await getOAuthToken();
        //     await createPicker();
        // } else {
        tokenClient.callback = async (response: any) => {
            if (response.error !== undefined) {
                throw (response);
            }
            accessToken = response.access_token;
            await createPicker();
        };
        // console.log(accessToken)
        if (accessToken === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({ prompt: '' });
        }
        // }
    }

    /**
     * Displays the file details of the user's selection.
     * @param {object} data - Containers the user selection from the picker
     */
    async function pickerCallback(data: any) {
        if (data.action === google.picker.Action.PICKED) {
            // let text = `Picker response: \n${JSON.stringify(data, null, 2)}\n`;
            const document = data[google.picker.Response.DOCUMENTS][0];
            const fileId = document[google.picker.Document.ID];
            console.log(fileId);
            const response = await gapi.client.drive.files.get({
                'fileId': fileId,
                fields: 'id, name, mimeType'
            });
            const file = response.result;
            if (file.mimeType.includes('application/vnd.google-apps')
                || file.mimeType.includes('application/vnd.google-apps.spreadsheet')
                || file.mimeType.includes('application/vnd.google-apps.document')
            ) {
                exportFile(fileId, file.name, file.mimeType);
            } else {
                getFileContent(fileId, file.name, file.mimeType);
            }
        }
    }

    async function exportFileFromDrive(fileId: string, name: string, mimeType: string) {
        try {
            const url = `https://content.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeType)}`;
            const accessToken = gapi.auth.getToken().access_token
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`  // 替换为你的 OAuth 2.0 访问令牌
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const fileExtension = getFileExtension(mimeType);
            const arrayBuffer = await response.arrayBuffer();
            const fileBlob = new Blob([arrayBuffer], { type: mimeType });
            const file = new File([fileBlob], `${name}.${fileExtension}`, { type: mimeType });
            return file;
        } catch (error) {
            console.error('Error exporting file:', error);
            throw error;
        }
    }
    async function exportFile(fileId: string, name: string, mimeType: string) {
        let exportMimeType: string = mimeType;
        if (mimeType === 'application/vnd.google-apps.document') {
            exportMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // 'application/pdf';
        } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
            exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else if (mimeType === 'application/vnd.google-apps.presentation') {
            exportMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        }
        const file = await exportFileFromDrive(fileId, name, exportMimeType);
        onSelect?.([file])

    }
    async function getFileContent(fileId: string, name: string, mimeType: string) {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        const base64String = btoa(response.body);
        const file = await base64ToFile(`data:${mimeType};base64,${base64String}`, name,)
        onSelect?.([file])
    }
    function loadScript(src: string) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => resolve(null);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }
    const loadGapiScript = async () => {
        try {
            await loadScript('https://apis.google.com/js/api.js');
            await loadScript('https://accounts.google.com/gsi/client');
        } catch (error) {
            console.error(error);
        }
    }
    const init = async () => {
        try {
            await loadGapiScript()
            gapi = (window as any).gapi;
            gapiLoaded();
            gisLoaded();
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        init();
    }, [])
    return (
        <Icon name='google-drive' height={18} width={18} onClick={handleAuthClick} />
    )
}
