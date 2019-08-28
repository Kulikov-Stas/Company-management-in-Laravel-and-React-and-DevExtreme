import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import {
    DataTypeProvider,
    TreeDataState, SortingState, EditingState, SelectionState, FilteringState, PagingState,
    CustomTreeData, IntegratedFiltering, IntegratedPaging, IntegratedSorting, IntegratedSelection,
    SearchState
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table, TableHeaderRow, TableEditRow, TableEditColumn, TableFilterRow, TableTreeColumn,
    PagingPanel, TableColumnResizing, Toolbar, TableColumnVisibility, ColumnChooser,
    SearchPanel, DragDropProvider
} from '@devexpress/dx-react-grid-material-ui';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import TableCell from '@material-ui/core/TableCell';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import { withStyles } from '@material-ui/core/styles';
import axios, { post } from "axios";

import { FileUploader, SelectBox, CheckBox } from 'devextreme-react';
import $ from 'jquery';

const styles = theme => ({
    lookupEditCell: {
        padding: theme.spacing(1),
    },
    dialog: {
        width: 'calc(100% - 16px)',
    },
    inputRoot: {
        width: '100%',
    },
});
const AddButton = ({ onExecute }) => (
    <div style={{ textAlign: 'center' }}>
        <Button
            color="primary"
            onClick={onExecute}
            title="Create new row"
        >
            New
        </Button>
    </div>
);

const EditButton = ({ onExecute }) => (
    <IconButton onClick={onExecute} title="Edit row">
        <EditIcon />
    </IconButton>
);

const DeleteButton = ({ onExecute }) => (
    <IconButton
        onClick={() => {
            // eslint-disable-next-line
            if (window.confirm('Are you sure you want to delete this row?')) {
                onExecute();
            }
        }}
        title="Delete row"
    >
        <DeleteIcon />
    </IconButton>
);

const CommitButton = ({ onExecute }) => (
    <IconButton onClick={onExecute} title="Save changes">
        <SaveIcon />
    </IconButton>
);

const CancelButton = ({ onExecute }) => (
    <IconButton color="secondary" onClick={onExecute} title="Cancel changes">
        <CancelIcon />
    </IconButton>
);

const commandComponents = {
    add: AddButton,
    edit: EditButton,
    delete: DeleteButton,
    commit: CommitButton,
    cancel: CancelButton,
};

const Command = ({ id, onExecute }) => {
    const CommandButton = commandComponents[id];
    return (
        <CommandButton
            onExecute={onExecute}
        />
    );
};

const LookupEditCellBase = ({
                                value, onValueChange, classes,
                            }) => (
    <TableCell
        className={classes.lookupEditCell}
    >
        <Select
            value={value}
            onChange={event => onValueChange(event.target.value)}
            input={(
                <Input
                    classes={{ root: classes.inputRoot }}
                />
            )}
        >
        </Select>
    </TableCell>
);
export const LookupEditCell = withStyles(styles)(LookupEditCellBase);

const Cell = (props) => {
    const { column } = props;
    return <Table.Cell {...props} />;
};

const EditCell = (props) => {
    const { column } = props;
    return <TableEditRow.Cell {...props} />;
};
const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter(r => r.parent_id === (row ? row.id : null));
    return childRows.length ? childRows : null;
};

const position_relationship = [
    '',
    'Marshal',
    'Colonel',
    'Major',
    'Captain',
    'Lieutenant'
];

const dragDisableIds = new Set([1]);
const allowDrag = ({ id }) => !dragDisableIds.has(id);

const filterInt = (value) => {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
        return Number(value);
    return NaN;
};

const EmployeeFormatterNoAuth = ({ row }) => (
    <div
        style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center'
        }}
    >
        <div
            style={{
                display: 'inline-block',
                background: 'white',
                borderRadius: '3px',
                width: '30px',
                height: '30px',
                margin: '-8px 8px -8px 0',
                textAlign: 'center',
            }}
        >
            <img
                src={`${(
                    (row.id+0 < 10) ? 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/0' + row.id :
                        (row.id+0 > 50) ? '/img/avatar' :
                            'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/' + row.id )}.png`}
                style={{
                    height: '28px',
                    margin: '0 auto',
                }}
                alt="Avatar"
            />
        </div>
        {row.fio}
    </div>
);

export default class EmployeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns : [
                { name: 'id', title: 'id' },
                { name: 'fio', title: 'Full name' },
                { name: 'position_id', title: 'Position (enter 1-5)', getCellValue: row => position_relationship[row.position_id] },
                { name: 'salary', title: 'Salary'},
                { name: 'employment_date', title: 'Employment date' },
                { name: 'parent_id', title: 'Parent Id' },
                /*{ name: 'photo', title: 'Avatar' },*/
            ],
            rows : [],
            pageSizes : [5, 10, 20],
            searchText: '',
            employeeColumns: ['fio'],
            expandedRowIds: [],
            editingRows: [],
            addedRows: [],
            changedRows: {},
            deletingRows: [],
            currentPage: 0,
            defaultHiddenColumnNames: ['parent_id', 'photo'],
            multiple: false,
            uploadMode: 'instantly',
            accept: '*',
            selectedFiles: [],
            photo: '',
            image: '',
            success: false,
            error: false,
            imagePreviewUrl: false,
            employeePhotoId: 0,
            /*defaultColumnWidths: [
                { columnName: 'id', width: '200' },
                { columnName: 'fio', width: '400' },
                { columnName: 'position_id', width: '200' },
                { columnName: 'salary', width: '200' },
                { columnName: 'employment_date', width: '200' },
                { columnName: 'parent_id', width: '200' },
                { columnName: 'photo', width: '200' },
            ]*/
        };
        this.myRef = React.createRef();

        this.EmployeeFormatter = ({ row }) => (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center'
                }}
            >
                <div
                    style={{
                        display: 'inline-block',
                        background: 'white',
                        borderRadius: '3px',
                        width: '30px',
                        height: '30px',
                        margin: '-8px 8px -8px 0',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src={`${(
                            (row.id+0 < 10) ? 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/0' + row.id :
                                (row.id+0 > 50) ? '/img/avatar' :
                                    'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/' + row.id )}.png`}
                        style={{
                            height: '28px',
                            margin: '0 auto',
                        }}
                        alt="Avatar"
                    />
                </div>

                <FileUploader multiple={false} accept={'*'} uploadMode={'instantly'}
                              uploadUrl={'#'}  onValueChanged={this.onSelectedFilesChanged} id={row.id} ref={this.myRef} />

                        <div className={'content'}></div>

                {row.fio}
            </div>
        );

        this.setExpandedRowIds = this.setExpandedRowIds.bind(this);
        this.changeEditingRows = editingRows => this.setState({ editingRows });
        this.changeAddedRows = addedRows => this.setState({
            addedRows: addedRows.map(row => (Object.keys(row).length ? row : {
                fio: '',
                position_id: 1,
                salary: 0,
                employment_date: new Date().toISOString().split('T')[0],
                parent_id: null,
                photo: ''
            })),
        });
        this.changeChangedRows = changedRows => this.setState({ changedRows });
        this.commitChanges = ({ added, changed, deleted }) => {
            //console.log(this);
            let rows = this.state.rows;
            if (added) {
                console.log(added[0]);
                axios.put('/api/employees/', added[0]).then(res => {
                    console.log(res.data);
                });
                const startingAddedId = (rows.length - 1) > 0 ? rows[rows.length - 1].id + 1 : 0;
                rows = [
                    ...rows,
                    ...added.map((row, index) => ({
                        id: startingAddedId + index,
                        ...row,
                    })),
                ];
            }
            if (changed) {
                let updated_id = 0;
                for (let key in changed) {
                     updated_id = key;
                }
                /*console.log(updated_id);
                console.log(changed[updated_id]);*/
                console.log(changed[updated_id]['parent_id']);
                if (changed[updated_id]['parent_id'] !== null) {
                    changed[updated_id]['parent_id'] = filterInt(changed[updated_id]['parent_id']); // int
                }
                console.log(changed[updated_id]['parent_id']);
                axios.put('/api/employees/' + updated_id, changed[updated_id]).then(res => {
                    console.log(this.state.rows[updated_id - 1]); // don't forget 0
                    //this.state.rows[updated_id - 1] =
                    console.log(res.data);
                    console.log(this.state);
                });
                //console.log(changed);
                rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
            }
            this.setState({ rows, deletingRows: deleted || this.state.deletingRows });
        };
        this.cancelDelete = () => this.setState({ deletingRows: [] });
        this.deleteRows = () => {
            const rows = this.state.rows.slice();
            this.state.deletingRows.forEach((rowId) => {
                const index = rows.findIndex(row => row.id === rowId);
                axios.delete('/api/employees/' + rowId).then(res => {
                    console.log(res.data);
                });
                if (index > -1) {
                    rows.splice(index, 1);
                }
            });
            this.setState({ rows, deletingRows: [] });
        };
        this.onSelectedFilesChanged = this.onSelectedFilesChanged.bind(this);
    }

    componentDidMount() {
        axios.get('/api/employees').then(res => {
            this.setState({
                rows: res.data
            });
            console.log(this.state.rows);
        });
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('update');
        let findThisGold = $('div.dx-fileuploader-file-status-message');
        if (findThisGold.length) {
            console.log(findThisGold.closest('.dx-widget').attr('id'));
            this.state.employeePhotoId = findThisGold.closest('.dx-widget').attr('id');
            findThisGold.closest('.dx-widget').children().remove();
        }
    }

    onSelectedFilesChanged(e) {
        console.log(this);
        const node = this.myRef.current;
        console.log(node);
        this.setState({ selectedFiles: e.value });
        this.createImage(this.state.selectedFiles);
        e.preventDefault();
    }

    createImage(file) {
        let reader = new FileReader();
        //reader.onload = (e) => {
            this.setState({
                photo: file
            });
        //};
        //reader.readAsDataURL(file);
        console.log(this.state.photo[0]);
        this.fileUpload(file);
    }

    fileUpload() {
        const values = this.state.photo[0];
        console.log(this.state);
        var self = this;
        let formData = new FormData();
        formData.append("file", values);
        let images = values,
            config = { headers: { 'enctype': 'multipart/form-data' } },
            total_files = 1,
            uploaded = 0;
        console.log(this.state.employeePhotoId);
        post("/photos/" + this.state.employeePhotoId, formData, config).then(response => {
            const done = response.data;
                console.log(done);
                $('#' + this.state.employeePhotoId + '.dx-widget').siblings('div').find('img').attr('src', '/storage/uploads/' + done.result.photo);
        });
        /*const apiClient = axios.create();
        apiClient.post('/photos/', {
            values
        }).then(res => {
            if(res.data === '1'){
                self.setState( { success : true});
            }else{
                self.setState( { errorInsert : true});
            }
        }).catch(err => {
            console.log(err);
        });*/

    }

    setExpandedRowIds(props) {
        // props is parent_id from 0
        let parent_id = '';
        if (props.length > 1) {
            parent_id = props.pop();
            props.push(parent_id);
            parent_id = [parent_id];
        } else {
            parent_id = props;
        }
        if (props.length > 0) {
            axios.get('/api/employees/parent_id=' + parent_id).then(res => {
                let childs_array = [];
                res.data.forEach(function(item, i, arr) {
                    for (let key in res.data[i]) {
                        if (key === 'id' && res.data[i].parent_id === parent_id) {
                            childs_array.push(res.data[i][key]);
                        }
                    }
                });
                let arr = this.state.rows.concat(res.data);
                let filteredArr = arr.reduce((acc, current) => {
                    const x = acc.find(item => item.id === current.id);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []);
                console.log(filteredArr);
                this.setState({
                    rows: filteredArr,
                    expandedRowIds: props.concat(childs_array)
                });
                console.log('expandedRowIds: ' + this.state.expandedRowIds);
            });
        } else {
            this.setState({
                expandedRowIds: []
            });
            console.log('expandedRowIds: ' + this.state.expandedRowIds);
        }
    }

    render() {
        console.log(this.props.login);
        if (this.props.login) {
            return (
                <Paper>
                    <Grid
                        rows={
                            this.state.rows
                                .map(employee => {
                                    return (
                                        {
                                            'id': employee.id,
                                            'fio': employee.fio,
                                            'parent_id': employee.parent_id,
                                            'position_id': employee.position_id,
                                            'salary': employee.salary,
                                            'employment_date': employee.employment_date,
                                            'photo': employee.photo
                                        }
                                    );
                                })
                        }
                        columns={this.state.columns}
                        getRowId={row => row.id}
                    >
                        <SearchState/>
                        <DataTypeProvider
                            for={this.state.employeeColumns}
                            formatterComponent={this.EmployeeFormatter}
                        />

                        <TreeDataState
                            expandedRowIds={this.state.expandedRowIds}
                            onExpandedRowIdsChange={this.setExpandedRowIds}
                        />
                        <FilteringState/>
                        <SortingState/>
                        <SelectionState/>
                        <PagingState
                            defaultCurrentPage={0}
                            defaultPageSize={this.state.pageSizes[2]}
                        />
                        <EditingState
                            editingRow={this.state.editingRow}
                            onEditingRowsChange={this.changeEditingRows}
                            changedRows={this.state.changedRows}
                            onChangedRowsChange={this.changeChangedRows}
                            addedRows={this.state.addedRows}
                            onAddedRowsChange={this.changeAddedRows}
                            onCommitChanges={this.commitChanges}
                        />
                        <CustomTreeData
                            getChildRows={getChildRows}
                        />

                        <IntegratedFiltering/>
                        <IntegratedSelection/>
                        <IntegratedSorting/>
                        <IntegratedPaging/>

                        <Table
                            columnExtensions={this.state.tableColumnExtensions}
                            cellComponent={Cell}
                        />
                        <TableColumnVisibility
                            defaultHiddenColumnNames={this.state.defaultHiddenColumnNames}
                        />
                        <TableColumnResizing
                            defaultColumnWidths={this.state.defaultColumnWidths}
                        />
                        <DragDropProvider
                            allowDrag={allowDrag}
                        />
                        <TableHeaderRow allowDragging
                            showSortingControls
                        />
                        <TableEditRow
                            cellComponent={EditCell}
                        />
                        <TableEditColumn
                            width={170}
                            showAddCommand={!this.state.addedRows.length}
                            showEditCommand
                            showDeleteCommand
                            commandComponent={Command}
                        />
                        <TableFilterRow/>
                        <TableTreeColumn
                            for="id"
                            showSelectionControls
                            showSelectAll
                        />

                        <Toolbar/>
                        <ColumnChooser/>
                        <SearchPanel/>
                        <PagingPanel
                            pageSizes={this.state.pageSizes}
                        />
                    </Grid>
                    <Dialog
                        open={!!this.state.deletingRows.length}
                    >
                        <DialogTitle>Delete Row</DialogTitle>
                        <DialogActions>
                            <Button onClick={this.cancelDelete} color="primary">Cancel</Button>
                            <Button onClick={this.deleteRows} color="accent">Delete</Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            );
        } else {
            return (
                <Paper>
                    <Grid
                        rows={
                            this.state.rows
                                .map(employee => {
                                    return (
                                        {
                                            'id': employee.id,
                                            'fio': employee.fio,
                                            'parent_id': employee.parent_id,
                                            'position_id': employee.position_id,
                                            'salary': employee.salary,
                                            'employment_date': employee.employment_date
                                        }
                                    );
                                })
                        }
                        columns={this.state.columns}
                        getRowId={row => row.id}
                    >
                        <DataTypeProvider
                            for={this.state.employeeColumns}
                            formatterComponent={EmployeeFormatterNoAuth}
                        />

                        <TreeDataState
                            expandedRowIds={this.state.expandedRowIds}
                            onExpandedRowIdsChange={this.setExpandedRowIds}
                        />
                        <FilteringState/>
                        <SortingState/>
                        <SelectionState/>
                        <PagingState
                            defaultCurrentPage={0}
                            defaultPageSize={this.state.pageSizes[2]}
                        />

                        <CustomTreeData
                            getChildRows={getChildRows}
                        />


                        <IntegratedSelection/>
                        <IntegratedPaging/>

                        <Table
                            columnExtensions={this.state.tableColumnExtensions}
                        />
                        <TableColumnVisibility
                            defaultHiddenColumnNames={this.state.defaultHiddenColumnNames}
                        />
                        <TableColumnResizing
                            defaultColumnWidths={this.state.defaultColumnWidths}
                        />
                        <TableHeaderRow
                            showSortingControls
                        />

                        <TableTreeColumn
                            for="id"
                        />

                        <PagingPanel
                            pageSizes={this.state.pageSizes}
                        />
                    </Grid>
                </Paper>
            );
        }
    }

}


