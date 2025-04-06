import React, { useEffect, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "chat-list/components/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "chat-list/components/ui/form";
import { Input } from "chat-list/components/ui/input";
import { Textarea } from 'chat-list/components/ui/textarea';
import { CheckboxGroup } from '../ui/checkbox';
import useChatState from 'chat-list/hook/useChatState';
import EmojiSelector from 'chat-list/components/emoji-select';
import { IAgent } from 'chat-list/types/agent';
import { cn } from 'chat-list/lib/utils';
import preview from 'chat-list/assets/img/preview.png';
import { DocType } from 'chat-list/types/plugin';
import { useTranslation } from 'react-i18next';
import i18n from 'chat-list/locales/i18n';
import PpromptSelect, { IPrompts } from 'chat-list/components/prompt-select';
// import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
// 更新表单的 schema 以匹配你的数据模型
const formSchema = z.object({
    avatar: z.string(),
    name: z.string().min(2, {
        message: i18n.t('form.nameeast_2char', "Name must be at least 2 characters.", {
            ns: 'agent'
        }),
    }).refine(value => /^[^\s]*$/.test(value), {
        message: 'Spaces are not allowed in the name.',
    }),
    description: z.string().min(2, {
        message: "Description must be at least 10 characters."
    }).max(100, {
        message: "Description must be at most 100 characters."
    }),
    introduce: z.string(),
    instruction: z.string(),
    tools: z.array(z.string()).optional(),
    // agents: z.array(z.string()).optional(),
    // visibility: z.enum(["private", "public"]),
    // status: z.enum(["active", "inactive"]),
    // version: z.string(),
    dataAsContext: z.boolean().optional(),
    // tags: z.array(z.string()),
    // actions: z.array(z.string()),
    // owner: z.string()
});

interface IAgentFormProps {
    docType: DocType;
    className?: string;
    value?: IAgent,
    onChange?: (data: z.infer<typeof formSchema>) => void,
    onSubmit?: (data: z.infer<typeof formSchema>) => void;
}

export default function AgenForm(props: IAgentFormProps) {
    const { docType, className, value, onSubmit, onChange } = props;
    const { t } = useTranslation(['agent', 'tool', 'base']);
    const { tools } = useChatState();
    console.log(JSON.stringify(tools, null, 2))
    const formSchema = useMemo(() => {
        const schema = z.object({
            avatar: z.string(),
            name: z.string().min(2, {
                message: t('form.name_least_2char', "Name must be at least 2 characters."),
            }).refine(value => /^[^\s]*$/.test(value), {
                message: t('form.not_allowd_space', 'Spaces are not allowed in the name.'),
            }),
            description: z.string().min(2, {
                message: t('form.description_least_10char', "Description must be at least 10 characters."),
            }).max(100, {
                message: t('form.description_max_100char', "Description must be at most 100 characters.")
            }),
            introduce: z.string().default('Hello! How can I assist you today?'),
            instruction: z.string(),
            type: z.string(),
            tools: z.array(z.string()).optional(),
            // agents: z.array(z.string()).optional(),
            // visibility: z.enum(["private", "public"]),
            // status: z.enum(["active", "inactive"]),
            // version: z.string(),
            dataAsContext: z.boolean().optional(),
            // tags: z.array(z.string()),
            // actions: z.array(z.string()),
            // owner: z.string()
        });
        return schema;
    }, [t]);
    // 使用 react-hook-form 创建表单
    const form = useForm<IAgent>({
        mode: 'onBlur',
        values: value || {
            name: '',
            type: docType,
            avatar: "😀",
            tools: [] as string[],
            introduce: '',
            description: '',
            instruction: ''
        },
        resolver: zodResolver(formSchema),

    });

    const onPromptSelect = (prompt: IPrompts) => {
        form.setValue('name', prompt.act.replace(/[\s]*/g, ''));
        form.setValue('instruction', prompt.prompt);
    };

    // const onFormChange = (values) => {
    //     console.log(values)
    // }
    useEffect(() => {

        const subscription = form.watch((value, { name, type }) => {
            if (name == 'name') {
                return;
            }
            onChange?.(value);
        });
        form.register('name', {
            onBlur() {

                const value = form.getValues();
                if (!value.introduce) {
                    const intro = (t('base:common.wellcome_message', '') as string).replace('Sally', value.name);
                    form.setValue('introduce', intro);
                    value.introduce = intro;
                }
                onChange?.(value);
            },
        });
        return () => {
            subscription.unsubscribe();
            form.unregister('name');
        };
    }, [form]);

    return (
        <Form {...form}  >
            <>
                <div className={cn('flex flex-col w-full relative ', className)}>
                    <form className="flex-1 shrink-0 p-2 space-y-2 mx-auto overflow-auto w-full">
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                                <FormItem>
                                    {/* <FormLabel>{t('avatar.field_name')}</FormLabel> */}
                                    <FormControl>
                                        <EmojiSelector {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('name.field_name', '')}</FormLabel>
                                    <FormControl>
                                        <div className='flex flex-row items-center'>
                                            <Input className='flex-1' placeholder={t('name.placeholder', '')} {...field} />
                                            <div className='px-1 cursor-pointer'>
                                                <PpromptSelect onSelect={onPromptSelect} />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('description.field_name', '')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('description.placeholder', '')} {...field} />
                                    </FormControl>
                                    <FormDescription>{t('description.description', '')}</FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="introduce"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('introduce.field_name', '')}</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} placeholder={t('introduce.placeholder', '')} {...field} />
                                    </FormControl>
                                    <FormDescription>{t('introduce.description', '')}</FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instruction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('instruction.field_name', '')}</FormLabel>
                                    <FormControl>
                                        <Textarea rows={docType == 'doc' ? 8 : 4} placeholder={t('instruction.placeholder', '')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tools"
                            render={({ field }) => {
                                const { value, ...rest } = field;
                                return (
                                    <FormItem>
                                        <FormLabel>{t('tools.field_name', '')}</FormLabel>
                                        <FormControl>
                                            <CheckboxGroup
                                                className='grid grid-cols-1 sm:grid-cols-2 gap-2'
                                                value={value || []} {...rest}
                                                options={tools.map((tool) => {
                                                    // const toolName = snakeToWords(tool.name);
                                                    return {
                                                        value: tool.name,
                                                        text: tool.displayName,
                                                    };
                                                })}
                                            />
                                        </FormControl>
                                        <FormDescription className=' whitespace-normal break-all'>
                                            {tools.length > 0 && t('tools.description', '')}
                                            {tools.length === 0 && t('tools.description.not_available', '')}
                                            <a href='https://forms.gle/RZjHvJrqE2SsANHz9' target='_blank' className='cursor-pointer text-blue-500' rel="noreferrer">{t('tools.new_tool_rquest', '')}</a>
                                        </FormDescription>
                                    </FormItem>
                                );
                            }}
                        />
                    </form>
                    <div className=' flex flex-row p-2 justify-between shadow  space-x-1'>
                        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                            {t('submit', '')}
                        </Button>
                        <Button type="button" variant="secondary" className={cn(
                            'w-20 group sm:hidden',
                            docType == 'doc' ? 'hidden' : '')}>
                            {t('preivew', '')}
                            <div className='bg-white fixed bottom-12 left-1 right-1 rounded-md shadow-md border overflow-hidden hidden group-hover:block'>
                                <p className=' whitespace-normal text-left p-2'>
                                    {t('preivew_instruction', '')}
                                </p>
                                <img src={preview} className='w-full' alt="" />
                            </div>
                        </Button>
                    </div>
                </div>
            </>
        </Form>
    );
}
