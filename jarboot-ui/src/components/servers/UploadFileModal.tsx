import {memo, useState} from "react";
import { Modal, Upload, Form, Input, Result } from 'antd';
import { InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import CommonNotice from "@/common/CommonNotice";
import StringUtil from "@/common/StringUtil";
import {useIntl} from "umi";
import UploadFileService from "@/services/UploadFileService";
import UploadHeartbeat from "@/components/servers/UploadHeartbeat";
import CommonUtils from "@/common/CommonUtils";

interface UploadFileModalProp {
    server?: string;
    onClose: () => void;
}
enum UploadFileStage {
    SERVER_CONFIRM,
    UPLOAD,
    SUBMITTING,
    SUBMIT,
    FAILED
}

const UploadFileModal = memo((props: UploadFileModalProp) => {
    //阶段，1：确定服务的名称；2：开始选择并上传文件；3：提交或清理
    const [stage, setStage] = useState(UploadFileStage.SERVER_CONFIRM);
    const [name, setName] = useState('');
    const [fileList, setFileList] = useState(new Array<any>());
    const [form] = Form.useForm();
    const intl = useIntl();
    const onOk = () => {
        switch (stage) {
            case UploadFileStage.SERVER_CONFIRM:
                onConfirm();
                break;
            case UploadFileStage.UPLOAD:
                onUpload();
                break;
            case UploadFileStage.SUBMIT:
            case UploadFileStage.FAILED:
                props.onClose && props.onClose();
                break;
            default:
                break;
        }
    };
    const onConfirm = () => {
        const server = form.getFieldValue("server");
        if (StringUtil.isEmpty(server)) {
            CommonNotice.info(intl.formatMessage({id: 'SELECT_UPLOAD_SERVER_TITLE'}));
            return;
        }
        UploadFileService.beginUploadServerFile(server).then(resp => {
            if (resp.resultCode === 0) {
                setName(server);
                setStage(UploadFileStage.UPLOAD);
                UploadHeartbeat.getInstance().start(server);
            } else {
                CommonNotice.errorFormatted(resp);
            }
        }).catch(CommonNotice.errorFormatted)
    };

    const onUpload = () => {
        const list = fileList.filter(value => 'done' === value.status);
        if (list.length <= 0) {
            CommonNotice.info(intl.formatMessage({id: 'UPLOAD_FILE_EMPTY'}));
            return;
        }
        UploadHeartbeat.getInstance().stop();
        setStage(UploadFileStage.SUBMITTING);
        UploadFileService.submitUploadFileInCache(name)
            .then(resp => {
                if (resp.resultCode === 0) {
                    setStage(UploadFileStage.SUBMIT);
                } else {
                    setStage(UploadFileStage.FAILED);
                    CommonNotice.errorFormatted(resp);
                }
            }).catch(error => {
                setStage(UploadFileStage.FAILED);
                CommonNotice.errorFormatted(error);
            });
    };

    const onCancel = () => {
        UploadHeartbeat.getInstance().stop();
        if (StringUtil.isNotEmpty(name)) {
            UploadFileService.clearUploadFileInCache(name);
        }
        props.onClose && props.onClose();
    };

    const checkFile = (file: any, show: boolean = true) => {
        const isLt = file.size / 1024 / 1024 < 500;
        if (!isLt) {
            show && CommonNotice.error(intl.formatMessage({id: 'FILE_SIZE_OVER_TIPS'}, {size: '500MB'}));
            return false;
        }
        const notUploaded = -1 === fileList.findIndex((value: any) => value.name === file.name);
        if (!notUploaded) {
            show && CommonNotice.error(intl.formatMessage({id: 'SUCCESS'}));
            return false;
        }
        return true;
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        action: `/api/jarboot/upload/upload`,
        headers: {Authorization: CommonUtils.getToken()},
        fileList: fileList,
        data: () => {
            return {server: form.getFieldValue("server")}
        },
        beforeUpload(file: any) {
            return checkFile(file) ? Promise.resolve(file) : Promise.reject();
        },
        onChange(info: any) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if ('done' === status || 'removed' === status) {
                setFileList(info.fileList);
            } else if (status === 'error') {
                CommonNotice.error(`${info.file.name} file upload failed.`);
            } else {
                if (checkFile(info.file, false)) {
                    setFileList(info.fileList);
                }
            }
        },
        onRemove(file: any) {
            UploadFileService.deleteFileInUploadCache(form.getFieldValue("server")
                , file.name)
                .then(resp => {
                    if (resp.resultCode !== 0) {
                        CommonNotice.errorFormatted(resp);
                    }
                }).catch(CommonNotice.errorFormatted);
        },
    };
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    };

    const getStageTitle = () => {
        let title = '';
        switch (stage) {
            case UploadFileStage.SERVER_CONFIRM:
                title = intl.formatMessage({id: 'SELECT_UPLOAD_SERVER_TITLE'});
                break;
            case UploadFileStage.UPLOAD:
            case UploadFileStage.SUBMITTING:
            case UploadFileStage.SUBMIT:
            case UploadFileStage.FAILED:
                title = intl.formatMessage({id: 'UPLOAD_STAGE_TITLE'}, {server: name});
                break;
            default:
                break;
        }
        return title;
    };

    return <Modal title={getStageTitle()}
                  visible={true}
                  destroyOnClose={true}
                  onOk={onOk} onCancel={onCancel}>
        {UploadFileStage.SERVER_CONFIRM === stage && <Form
            {...layout}
            form={form}
            initialValues={{server: props.server}}
        >
            <Form.Item label={intl.formatMessage({id: 'NAME'})} name={"server"}>
                <Input autoComplete="off"
                       autoCorrect="off"
                       autoCapitalize="off"
                       spellCheck="false"
                       placeholder="input update or new server name" />
            </Form.Item>
        </Form>}
        {UploadFileStage.UPLOAD === stage && <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">{intl.formatMessage({id: 'SELECT_UPLOAD_SERVER_TITLE'})}</p>
            <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                band files
            </p>
        </Upload.Dragger>}
        {UploadFileStage.SUBMITTING === stage && <div>
            <Result
                icon={<LoadingOutlined />}
                title="Submitting..."
            />
        </div>}
        {UploadFileStage.SUBMIT === stage && <div>
            <Result
                status="success"
                title="Successfully Update Server!"
            />
        </div>}
        {UploadFileStage.FAILED === stage && <div>
            <Result
                status="error"
                title="Error Update Server!"
            />
        </div>}
    </Modal>
});

export default UploadFileModal;
