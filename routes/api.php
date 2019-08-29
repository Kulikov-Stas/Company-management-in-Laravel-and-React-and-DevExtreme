<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('employees/parent_id={id}', 'EmployeeController@show');
Route::resource('employees', 'EmployeeController');

//Route::group(['middleware' => 'auth'], function () {
    Route::put('/employees/{employee}', 'EmployeeController@update');
    Route::delete('/employees/{employee}', 'EmployeeController@delete');
    Route::put('/employees', 'EmployeeController@store'); // axios does not let post request ...
//});

