# Company management in Laravel and React and DevExtreme

##Презентация

[Кратко о том, что сделано](https://villa-pinia.com/wp-content/uploads/design-library/laravel-react-management.mp4)

##Быстрая загрузка
- git clone
- composer install
- npm install
- npm run watch 

## Database
- laravel new company
- Создаём базу данных company
- в .env
```bash
        DB_DATABASE=company
	DB_USERNAME=[db username]
	DB_PASSWORD=[db password]
```
и в config/database.php

```bash
     'database' => env('DB_DATABASE', 'company'),
     'username' => env('DB_USERNAME', [db username]),
     'password' => env('DB_PASSWORD', [db password]),
```
- добавляем домен к локальному серверу
	company папка домена /company/public
- переходим по урлу http://company/
- cd company
- php artisan make:model Employee -cmf
```bash
    Model created successfully.
    Factory created successfully.
    Created Migration: 2019_08_23_094129_create_employees_table
    Controller created successfully.
```
- php artisan make:resource Employee (или -crmf выше)
- прописываем up миграции create_employees_table
```bash
public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('parent_id')->nullable();
            $table->unsignedInteger('position_id');
            $table->foreign('parent_id')->references('id')->on('employees');
            $table->foreign('position_id')->references('id')->on('positions');
            $table->string('name', 25);
            $table->decimal('salary', 8, 2);
            $table->string('photo', 50)->nullable();
            $table->date('employment_date');
            $table->timestamps();
        });
    }
```
- php artisan make:model Position -m
```bash
public function up()
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 25);
            $table->timestamps();
        });
    }
```
- php artisan migrate --path="database/migrations/[time]_create_users_table.php" 
  
- php artisan migrate --path="database/migrations/[time]_create_password_resets_table.php"
  
- php artisan migrate --path="database/migrations/[time]_create_positions_table.php"
    
- php artisan migrate --path="database/migrations/[time]_create_employees_table.php"
- composer dump-autoload
- php artisan make:seeder EmployeesTableSeeder
- php artisan make:seeder PositionsTableSeeder
- в database/factories/EmployeeFactory.php
```bash
$factory->define(Employee::class, function (Faker $faker) {
    return [
        'fio' => $this->faker->name,
        'position_id' => $this->faker->numberBetween(1, 5),
        'salary' => $this->faker->randomFloat(2, 100, 2000),
        'employment_date' => $this->faker->date('Y-m-d')
    ];
});
```
- composer require --dev barryvdh/laravel-ide-helper
- в config/app.php Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider::class,
- php artisan ide-helper:generate
- наполняем database/seeds/EmployeesTableSeeder
```bash
    /**
     * EmployeesTableSeeder constructor.
     */
    public function __construct()
    {
        $this->faker = Faker\Factory::create();
    }
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        factory(Employee::class, 10)->create(['position_id' => 1])->each(function ($q) {
            factory(Employee::class, 10)->create(['parent_id' => $q->id, 'position_id' => 2])->each(function ($w) {
                factory(Employee::class, 10)->create(['parent_id' => $w->id, 'position_id' => 3])->each(function ($e) {
                    factory(Employee::class, 10)->create(['parent_id' => $e->id, 'position_id' => 4])->each(function ($r) {
                        factory(Employee::class, 10)->create(['parent_id' => $r->id, 'position_id' => 5])->each(function ($t) {
                            $this->command->info($t->id);
                        });
                    });
                });
            });
        });
    }
```
- в database/seeds/PositionsTableSeeder
```bash
   public function run()
   {
       DB::table('positions')->insert([
           ['name' => 'Marshal'],
           ['name' => 'Colonel'],
           ['name' => 'Major'],
           ['name' => 'Captain'],
           ['name' => 'Lieutenant'],
       ]);
   }
```
- в модели Employee
```bash
protected $fillable = [
        'fio',
        'parent_id',
        'position_id',
        'salary',
        'employment_date',
        'photo'
    ];
```
- в модели Position
```bash
protected $fillable = [
        'name'
    ];
```
- php artisan make:seeder UsersTableSeeder
- в database/seeds/UsersTableSeeder.php
```bash
        User::create([
            'name' => 'admin',
            'email' => 'admin@admin.net',
            'password' => bcrypt('password')
        ]);
```
- в database/seeds/DatabaseSeeder.php 
```bash
        $this->call([
            PositionsTableSeeder::class,
            UsersTableSeeder::class,
            EmployeesTableSeeder::class
        ]);
```
- php artisan db:seed
## Relationships
- в модели Position
```bash
    public function employees()
        {
            return $this->belongsTo(Employee::class, 'position_id');
        }
```
- в модели Employee
```bash
    public function position()
    {
        return $this->hasOne('App\Position', 'id', 'position_id');
    }

    public function parent()
    {
        return $this->belongsTo('App\Employee', 'parent_id');
    }

    public function child()
    {
        return $this->hasMany('App\Employee', 'parent_id');
    }
```
## Listing routes and controllers
- в routes/api.php
```bash
Route::get('employees/parent_id={id}', 'EmployeeController@show');
Route::resource('employees', 'EmployeeController');
```
- в Http/Controllers/EmployeeController.php
```bash
    /**
     * @var EmployeeService 
     */
    private $employee;

    /**
     * EmployeeController constructor.
     * @param EmployeeService $employee
     */
    public function __construct(EmployeeService $employee)
    {
        $this->employee = $employee;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $employees = $this->employee->getEmployees($request->name);
        return response()->json($employees);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $parent_id
     * @return \Illuminate\Http\Response
     */
    public function show($parent_id)
    {
        $employee = $this->employee->getEmployeeByEmployeeId($parent_id);
        return response()->json($employee);
    }
```
- в Services/EmployeeService.php
```bash
    /**
     * @param string $name
     * @return \Illuminate\Support\Collection
     */
    public function getEmployees($name = '')
    {
        if (!empty($name)) {
            return Employee::with(['position', 'child'])->where('fio', 'like', "%$name%")->orderBy('id')->get();
        }
        return Employee::with(['position', 'child'])
            ->whereNull('parent_id')
            ->orwhereIn('parent_id', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            ->orderBy('id')->get();
    }

    /**
     * @param int $employeeId
     * @return array
     */
    public function getEmployeeByEmployeeId(int $employeeId)
    {
        $parents = Employee::with(['position', 'child'])->where('parent_id', $employeeId)->get();
        $childs = [];
        $all_childs = [];
        foreach ($parents as &$parent) {
            if (!empty($parent->child)) {
                $childs = $parent->child;
                foreach ($childs as &$child) {
                    $all_childs[] = $child;
                }
            }
        }
        return array_merge($all_childs, $parents->toArray());
    }
```
## React Frontend
- npm install bootstrap
- php artisan preset react
- npm install
- npm install --save @material-ui/core
- npm install --save @material-ui/icons
- npm install --save @material-ui/styles
- npm install --save prop-types
- npm install --save classnames
- npm install --save superagent
- npm i --save @devexpress/dx-react-core @devexpress/dx-react-grid
- npm i --save @devexpress/dx-react-grid-material-ui
- меняем resources/views/welcome.blade.php
```bash
<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Company management in Laravel and React</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
<div id="root"></div>
<script src="{{asset('js/app.js')}}"></script>
</body>
</html>
```
- создаём директорию resources/js/containers
- в resources/js/components создаём Header.js
```bash
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

function Header(props) {
    const { classes } = props;
    return (
        <div className={classes.root}>
            <AppBar position="static" style={{ background: '#007784' }}>
                <Toolbar>
                    <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" className={classes.grow}>
                        Company management in Laravel and React
                    </Typography>
                    <Button color="inherit" onClick={props.logout}>Logout</Button>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default withStyles(styles)(Header);
```
- в resources/js/containers/Main.js
```bash
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';

export default class Main extends Component {

    render() {
        return (
            <div>
                <Home />
            </div>
        );
    }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
```
- в resources/js/containers/Home.js
```bash
import React, { Component } from 'react';
import EmployeeList from "./EmployeeList";
import Header from "../components/Header";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 'list',
            selectedEmployeeId: '',
        };
        this.handleChangePage = this.handleChangePage.bind(this);
        this.setSelectedEmployeeId = this.setSelectedEmployeeId.bind(this);
    }

    componentDidMount() {

    }

    handleChangePage(page) {
        this.setState({ page: page });
    }

    setSelectedEmployeeId(id) {
        this.setState({
            selectedEmployeeId: id
        });
    }

    render() {
        return (
            <div className="container">
                <Header
                    logout={this.props.logout}
                />
                {
                    this.state.page === 'list' &&
                    <EmployeeList
                        handleChangePage={this.handleChangePage}
                        setSelectedEmployeeId={this.setSelectedEmployeeId}
                    />
                }                
            </div>
        );
    }
}

```
- самая для листинга главная resources/js/containers/EmployeeList.js
```bash
import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import {
    DataTypeProvider,
    TreeDataState, SortingState, SelectionState, FilteringState, PagingState,
    CustomTreeData, IntegratedFiltering, IntegratedPaging, IntegratedSorting, IntegratedSelection,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table, TableHeaderRow, TableFilterRow, TableTreeColumn,
    PagingPanel, TableColumnResizing, Toolbar, TableColumnVisibility, ColumnChooser,
} from '@devexpress/dx-react-grid-material-ui';
import axios from "axios/index";


const getRowId = row => row.id;
const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter(r => r.parent_id === (row ? row.id : null));
    return childRows.length ? childRows : null;
};

const EmployeeFormatter = ({ row }) => (
    <div
        style={{
            display: 'flex',
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
                { name: 'fio', title: 'ФИО' },
                { name: 'position', title: 'Должность' },
                { name: 'salary', title: 'Зар​плата'},
                { name: 'employment_date', title: 'Дата ​приёма' },
            ],
            rows : [],
            pageSizes : [5, 10, 20],
            page: 0,
            searchText: '',
            employeeColumns: ['fio'],
            expandedRowIds: []
        };
        this.setExpandedRowIds = this.setExpandedRowIds.bind(this);
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
        return (
            <Paper>
                <Grid
                    rows={
                            this.state.rows
                            .map(employee => {
                                /*console.log({
                                    'id': employee.id,
                                    'parent_id': employee.parent_id,
                                    'fio':employee.fio,
                                    'position':employee.position.name,
                                    'salary':employee.salary,
                                    'employment_date':employee.employment_date
                                });*/
                                return (
                                    {
                                        'id': employee.id,
                                        'fio':employee.fio,
                                        'parent_id': employee.parent_id,
                                        'position':employee.position.name,
                                        'salary':employee.salary,
                                        'employment_date':employee.employment_date
                                    }
                                );
                            })
                    }
                    columns={this.state.columns}
                    getRowId={getRowId}
                >
                    <DataTypeProvider
                        for={this.state.employeeColumns}
                        formatterComponent={EmployeeFormatter}
                    />

                    <TreeDataState
                        expandedRowIds={this.state.expandedRowIds}
                        onExpandedRowIdsChange={this.setExpandedRowIds}
                    />
                    <FilteringState />
                    <SortingState />
                    <SelectionState />
                    <PagingState
                        defaultCurrentPage={0}
                        defaultPageSize={this.state.pageSizes[2]}
                    />

                    <CustomTreeData
                        getChildRows={getChildRows}
                    />

                    <IntegratedFiltering />
                    <IntegratedSelection />
                    <IntegratedSorting />
                    <IntegratedPaging />

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
                    <TableFilterRow />
                    <TableTreeColumn
                        for="id"
                        showSelectionControls
                        showSelectAll
                    />

                    <Toolbar />
                    <ColumnChooser />

                    <PagingPanel
                        pageSizes={this.state.pageSizes}
                    />
                </Grid>

            </Paper>
        );
    }
}
```
- в resources/js/app.js меняем последнюю строчку
```bash
require('./containers/Main');
```
- листинг, поиск, сортировки, фильтры готовы, проверяем
```bash
npm run watch
```
## Авторизация
- php artisan make:auth
- npm install --save react-router-dom

- в resources/views/home.blade.php, куда попадут только авторизованные пользователи
```bash
<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Company management in Laravel and React</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
<div id="root"></div>
<script type="text/javascript">
    window.localStorage.setItem('accessToken', '{{ csrf_token() }}');
</script>
<script src="{{asset('js/app.js')}}"></script>
</body>
</html>
```
- в resources/js/containers/Main.js
```bash
    render() {
        console.log(window.localStorage.getItem('accessToken'));
        if (window.localStorage.getItem('accessToken')) {
            return (
                <div>
                    <Auth />
                </div>
            );
        } else {
            return (
                <div>
                    <Home />
                </div>
            );
        }

    }
```
- resources/js/containers/Auth.js
```bash
import React, { Component } from 'react';
import EmployeeList from "./EmployeeList";
import Header from "../components/Header";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 'list',
            selectedEmployeeId: '',
        };
        this.login = this.login.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.setSelectedEmployeeId = this.setSelectedEmployeeId.bind(this);
    }

    componentDidMount() {

    }

    handleChangePage(page) {
        this.setState({ page: page });
    }

    setSelectedEmployeeId(id) {
        this.setState({
            selectedEmployeeId: id
        });
    }

    login() {
        console.log('login');
    }

    render() {
        return (
            <div className="container">
                <Header
                    login={true}
                />
                {
                    this.state.page === 'list' &&
                    <EmployeeList
                        handleChangePage={this.handleChangePage}
                        setSelectedEmployeeId={this.setSelectedEmployeeId}
                        login={true}
                    />
                }                
            </div>
        );
    }
}

```
- благодаря пропсу this.props.login можно узнать авотризован пользователь или нет
- меняем соответственно resources/js/containers/EmployeeList.js
```bash
import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import {
    DataTypeProvider,
    TreeDataState, SortingState, SelectionState, FilteringState, PagingState,
    CustomTreeData, IntegratedFiltering, IntegratedPaging, IntegratedSorting, IntegratedSelection,
    SearchState
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table, TableHeaderRow, TableFilterRow, TableTreeColumn,
    PagingPanel, TableColumnResizing, Toolbar, TableColumnVisibility, ColumnChooser,
    SearchPanel, DragDropProvider
} from '@devexpress/dx-react-grid-material-ui';
import axios from "axios/index";


const getRowId = row => row.id;
const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter(r => r.parent_id === (row ? row.id : null));
    return childRows.length ? childRows : null;
};

const EmployeeFormatter = ({ row }) => (
    <div
        style={{
            display: 'flex',
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

const dragDisableIds = new Set([1]);
const allowDrag = ({ id }) => !dragDisableIds.has(id);

export default class EmployeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns : [
                { name: 'id', title: 'id' },
                { name: 'fio', title: 'Full name' },
                { name: 'position', title: 'Position' },
                { name: 'salary', title: 'Salary'},
                { name: 'employment_date', title: 'Employment date' },
            ],
            rows : [],
            pageSizes : [5, 10, 20],
            page: 0,
            searchText: '',
            employeeColumns: ['fio'],
            expandedRowIds: []
        };
        this.setExpandedRowIds = this.setExpandedRowIds.bind(this);
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
                                            'position': employee.position.name,
                                            'salary': employee.salary,
                                            'employment_date': employee.employment_date
                                        }
                                    );
                                })
                        }
                        columns={this.state.columns}
                        getRowId={getRowId}
                    >
                        <SearchState/>
                        <DataTypeProvider
                            for={this.state.employeeColumns}
                            formatterComponent={EmployeeFormatter}
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

                        <IntegratedFiltering/>
                        <IntegratedSelection/>
                        <IntegratedSorting/>
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
                        <DragDropProvider
                            allowDrag={allowDrag}
                        />
                        <TableHeaderRow
                            showSortingControls
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
                                            'position': employee.position.name,
                                            'salary': employee.salary,
                                            'employment_date': employee.employment_date
                                        }
                                    );
                                })
                        }
                        columns={this.state.columns}
                        getRowId={getRowId}
                    >
                        <DataTypeProvider
                            for={this.state.employeeColumns}
                            formatterComponent={EmployeeFormatter}
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
```
- и под пропс props.login переделываем resources/js/components/Header.js
```bash
    { props.login ?
        <a style={{ color: 'white', fontSize: '1.25em', fontFamily: "Roboto", fontWeight: 500, lineHeight: 1.6 }} href="/logout/" onClick={window.localStorage.clear()}>Logout</a> :
        <ul className="nav navbar-nav navbar-right">
            <li><a style={{ color: 'white', fontSize: '1.25em', fontFamily: "Roboto", fontWeight: 500, lineHeight: 1.6 }} href="/login/">Login</a></li>
            <li><a style={{ color: 'white', fontSize: '1.25em', fontFamily: "Roboto", fontWeight: 500, lineHeight: 1.6 }} href="/register/">Register</a></li>
        </ul>
    }
```
- при логауте очищаем localStorage
- в LoginController добавляем
```bash
use Auth;
use Illuminate\Http\Request;
...
    public function logout(Request $request) {
        Auth::logout();
        return redirect('/');
    }
```
## CRUD операции
- меняем resources/js/containers/EmployeeList.js
```bash
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
import axios from "axios/index";

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

const EmployeeFormatter = ({ row }) => (
    <div
        style={{
            display: 'flex',
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

export default class EmployeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns : [
                { name: 'id', title: 'id' },
                { name: 'fio', title: 'Full name' },
                { name: 'position_id', title: 'Position', getCellValue: row => position_relationship[row.position_id] },
                { name: 'salary', title: 'Salary'},
                { name: 'employment_date', title: 'Employment date' },
                { name: 'parent_id', title: 'Parent Id' }
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
            defaultHiddenColumnNames: ['parent_id']
        };
        this.setExpandedRowIds = this.setExpandedRowIds.bind(this);
        this.changeEditingRows = editingRows => this.setState({ editingRows });
        this.changeAddedRows = addedRows => this.setState({
            addedRows: addedRows.map(row => (Object.keys(row).length ? row : {
                fio: '',
                position_id: 1,
                salary: 0,
                employment_date: new Date().toISOString().split('T')[0],
                parent_id: null
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
                                            'employment_date': employee.employment_date
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
                            formatterComponent={EmployeeFormatter}
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
                            formatterComponent={EmployeeFormatter}
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
```
- в api роутере
```bash
Route::group(['middleware' => 'auth'], function () {
    Route::put('/employees/{employee}', 'EmployeeController@update');
    Route::delete('/employees/{employee}', 'EmployeeController@delete');
    Route::put('/employees', 'EmployeeController@store'); // axios does not let post request ...
});
```
- в контроллере Http/Controllers/EmployeeController.php
```bash
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::find($id)->update($request->all());
        return response()->json($employee, 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Employee  $employee
     * @return \Illuminate\Http\Response
     */
    public function delete(Employee $employee)
    {
        $employee->delete();
        return response()->json(null, 204);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $post = $request->all();

        $employee = Employee::create($request->all());
        return response()->json($employee, 201);
    }
```
## Аватары
- npm install devextreme-react
- переделываем EmployeeFormatter в resources/js/containers/EmployeeList.js, закидываем в класс
```bash
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
```
- php artisan make:controller FileuploadController
- в api роутере Route::resource('fileupload', 'FileuploadController');
- composer require intervention/image
- в config/app.php 
```bash
'providers' => [
 Intervention\Image\ImageServiceProvider::class,
];

'aliases' => [
 'Image' => Intervention\Image\Facades\Image::class,
]
```
- php artisan vendor:publish --provider="Intervention\Image\ImageServiceProviderLaravel5"


- в web роутер
```bash
Route::post('/photos/{id}', 'EmployeeController@updatePhoto');
```
- php artisan storage:link
- в Http/Controllers/EmployeeController.php
```bash
        /**
         * @param Request $request
         * @param  int  $id
         * @return \Illuminate\Http\JsonResponse
         */
        public function updatePhoto(Request $request, int $id)
        {
            $data = $request->all();
            $employee = Employee::find($id);
            if (isset($employee->photo)) {
                Storage::disk('public')->delete($employee->photo);
            }
    
            $file = $request->file('file');
            $ext = $file->extension();
            $name = str_random(20) . '.' . $ext ;
            $path = Storage::disk('public')->putFileAs(
                'uploads', $file, $name
            );
    
            $data['photo'] = $name;
    
            $employee->update($data);
    
            return response()
                ->json([
                    'result' => $data,
                    'id' => intval($id)
                ]);
        }
```
- memory_limit = 256M в php.ini
- в resources/js/containers/EmployeeList.js
```bash
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

```
- без jQuery не обошлось как я ни старался:
```bash
    componentDidUpdate(prevProps, prevState) {
        console.log('update');
        let findThisGold = $('div.dx-fileuploader-file-status-message');
        if (findThisGold.length) {
            console.log(findThisGold.closest('.dx-widget').attr('id'));
            this.state.employeePhotoId = findThisGold.closest('.dx-widget').attr('id');
            findThisGold.closest('.dx-widget').children().remove();
        }
    }
```
