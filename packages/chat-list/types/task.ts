export interface ITask {
    id: number;
    task: string;
    skill: string;
    dependent_task_ids: number[];
    status: 'pending' | 'done' | 'failed';
}
