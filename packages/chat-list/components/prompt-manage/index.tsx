import React, { useEffect, useState } from 'react';
import { Card, } from 'chat-list/components/ui/card';
import { Button } from 'chat-list/components/button';
import { Input } from 'chat-list/components/ui/input';
import { Textarea } from 'chat-list/components/ui/textarea';
import { Edit, Plus, Trash2 } from 'lucide-react';
import IconButton from 'chat-list/components/icon-button';
import usePrompts from 'chat-list/hook/usePrompts';
import Modal from 'chat-list/components/modal';
import Loading from '../loading';
import { useTranslation } from 'react-i18next';
import useChatState from 'chat-list/hook/useChatState';

const PromptManagement = () => {
    const { docType } = useChatState();
    const { prompts, addPrompts, loadPrompts, removePropmt, loading } = usePrompts(docType);
    const [formData, setFormData] = useState({ id: '', name: '', prompt: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { t } = useTranslation(['base']);

    const openAdd = () => {
        setFormData({ id: '', name: '', prompt: '' });
        setIsDialogOpen(true);
    }
    const handleAdd = async () => {
        if (formData.name && formData.prompt) {
            await addPrompts(formData.name, formData.prompt, formData.id)
            await loadPrompts();
            setFormData({ id: '', name: '', prompt: '' });
            setIsDialogOpen(false);
        }
    };
    const handleEdit = async (item: any) => {
        // await editPrompt(item.id, item.name, item.prompt)
        // await loadPrompts();
        setFormData(item);
        setIsDialogOpen(true);
    }

    const handleDelete = async (item: any) => {
        await removePropmt(item.id)
        await loadPrompts();
    };

    const init = async () => {

        await loadPrompts();
    }
    useEffect(() => {
        init();
    }, [])

    if (loading) {
        return (
            <div className='w-full flex flex-col items-center justify-center'>
                <Loading />
            </div>
        )
    }

    return (
        <div className="w-full flex-1 flex flex-col  mx-auto p-2 space-y-2 overflow-hidden">
            <div className='w-full flex flex-row items-center justify-start'>
                <Button icon={Plus} variant='secondary' size='sm' onClick={openAdd} className="w-auto sm:w-auto">
                    {t('common.add_prompt')}
                </Button>
            </div>
            {
                prompts.length === 0 && (
                    <div className='w-full flex flex-col items-center justify-center'>
                        <p className='text-gray-500 text-sm'>
                            {t('common.no_prompt')}
                        </p>
                    </div>
                )
            }
            <div className='w-full p-0 flex-1 overflow-auto space-y-2'>
                {prompts.map((prompt, index) => (
                    <Card key={index} className="p-2">
                        <div className="flex justify-between items-start relative">
                            <div className="space-y-2 flex-1">
                                <h3 className="font-medium">{prompt.name}</h3>
                                <p className="text-sm text-gray-500">{prompt.prompt}</p>
                            </div>
                            <div className='flex flex-row items-center space-x-1 absolute top-1 right-1'>
                                <IconButton
                                    icon={Edit}
                                    onClick={() => handleEdit(prompt)}
                                    className=" h-6 w-6"
                                >
                                </IconButton>
                                <IconButton
                                    icon={Trash2}
                                    onClick={() => handleDelete(prompt)}
                                    className="text-red-500 hover:text-red-700 h-6 w-6"
                                >
                                </IconButton>
                            </div>

                        </div>
                    </Card>
                ))}
            </div>
            <Modal
                title={formData.id ? t('common.edit') : t('common.add')}
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                confirmText={formData.id ? t('common.update') : t('common.save')}
                showClose={true}
                closeText={t('common.close')}
                onConfirm={handleAdd}
            >
                <div className="space-y-2">
                    <Input
                        placeholder={t('common.short_name')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full"
                    />
                    <Textarea
                        placeholder={t('common.prompt_placeholder')}
                        value={formData.prompt}
                        onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                        className="w-full min-h-[100px]"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default PromptManagement;