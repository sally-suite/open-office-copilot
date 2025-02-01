export type ColumnType = 'string' | 'number' | 'boolean';
export interface ColumnConfigItem {
  /**
   * field key
   */
  key: string;
  /**
   * field display content
   */
  label?: string;
  /**
   * field name of entity
   */
  field?: string;
  /**
   * field value type
   */
  type?: ColumnType;

  format?: (value: any) => string;
  /**
   * field options
   */
  options?: { id: string | number; name: string }[];
}

export type ColumnConfig = ColumnConfigItem[];

export const TESTCASE_COL_CONFIG: ColumnConfig = [
  {
    key: 'id',
    label: 'ID',
    type: 'number',
    field: 'id',
  },
  {
    key: 'title',
    label: 'Title',
    field: 'title',
    type: 'string',
  },
  {
    key: 'suite', // same with Planned UAT Start Date
    label: 'Test Suite',
    type: 'number',
    field: 'suite_id',
  },
  {
    key: 'section', // same with Planned Release Date
    label: 'Section',
    type: 'number',
    field: 'section_id',
  },
  {
    key: 'milestone',
    label: 'Milestone',
    type: 'number',
    field: 'milestone_id',
  },
  {
    key: 'type',
    label: 'Type',
    type: 'number',
    field: 'type_id',
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'number',
    field: 'priority_id',
  },
  {
    key: 'refs',
    label: 'References',
    type: 'string',
    field: 'refs',
  },
  {
    key: 'estimate',
    label: 'Estimate',
    type: 'string',
    field: 'estimate',
  },
];

export const TESTCASE_FIXED_FIELD = ['id', 'title'];
export const TESTCASE_SELECTED_FIELD = ['section', 'type', 'priority'];

export const TESTRESULT_COL_CONFIG: ColumnConfig = [
  {
    key: 'test-id',
    label: 'Test ID',
    type: 'number',
    field: 'id',
  },

  {
    key: 'title',
    label: 'Title',
    type: 'string',
    field: 'title',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'number',
    field: 'result.status_id',
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'number',
    field: 'priority_id',
  },
  {
    key: 'result-id',
    label: 'Result ID',
    type: 'number',
    field: 'result.id',
  },
  {
    key: 'assign-to',
    label: 'Assign To',
    type: 'number',
    field: 'result.assignedto_id',
  },
  {
    key: 'version',
    label: 'Version',
    type: 'string',
    field: 'result.version',
  },
  {
    key: 'defects',
    label: 'Defects',
    type: 'string',
    field: 'result.defects',
  },
  {
    key: 'comment',
    label: 'Comment',
    type: 'string',
    field: 'result.comment',
  },
];

export const TESTRESULT_FIXED_FIELD = ['test-id', 'title', 'status'];
export const TESTRESULT_SELECTED_FIELD = ['assign-to', 'comment'];

export const FIELD_TO_STATE: any = {
  priority: 'priorities',
  status: 'status',
  section: 'sections',
  suite: 'suites',
  milestone: 'milestones',
  'assign-to': 'users',
  type: 'caseTypes',
};
