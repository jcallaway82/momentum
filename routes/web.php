<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});



//Pipe-Line Home Table routes
Route::get('/home', 'HomeController@index')->name('home');
Route::get('/getActiveLoans', 'HomeController@getActiveLoans');
Route::get('/getProcWorksheets', 'HomeController@getProcWorksheets');
Route::get('/getTaskList', 'HomeController@getTaskList');
Route::post('/updateLoan', 'HomeController@updateLoan');

//Filter routes
Route::post('/updateFilters', 'PipelineFilterController@updateFilters');
Route::get('/clearFilters', 'PipelineFilterController@clearFilters');

//Loan Detail Routes
Route::get('/loanDetail/{loan}/{tab}/{fieldName}', 'LoanDetailController@getLoanDetail');
Route::post('/loanDetail', 'LoanDetailController@getLoanDetail');
Route::post('/checkIfTaskLocked', 'LoanDetailController@checkIfTaskLocked');
Route::post('/lockTaskForEdit', 'LoanDetailController@lockTaskForEdit');
Route::post('/updateTask', 'LoanDetailController@updateTask');
Route::post('/cancelUpdate', 'LoanDetailController@cancelUpdate');

//Processor Needs List Routes
Route::post('/getNeedsList', 'ProcNeedListController@getNeedsList');
Route::post('/updateProcNeeds', 'ProcNeedListController@updateProcNeeds');

//UW Condition List Routes
Route::post('/getCondList', 'UWConditionController@getCondList');
Route::post('/updateCondList', 'UWConditionController@updateCondList');

//Alert routes
Route::get('/getAlerts', 'AlertsController@getAlerts');
Route::get('/clearAllAlerts', 'AlertsController@clearAllAlerts');
Route::post('/clearAlert', 'AlertsController@clearAlert');

//Comment & Reply routes
Route::post('/addComment', 'CommentController@addComment');
Route::post('/deleteComment', 'CommentController@deleteComment');
Route::post('/addReply', 'ReplyController@addReply');
Route::post('/deleteReply', 'ReplyController@deleteReply');

//Borrower & REO routes
Route::post('/getBorrowers', 'BorrowerController@getBorrowers');
Route::post('/addBorrower', 'BorrowerController@addBorrower');
Route::post('/deleteBorrower', 'BorrowerController@deleteBorrower');
Route::post('/addREO', 'ReoController@addREO');
Route::post('/deleteREO', 'ReoController@deleteREO');

//User Administration Routes
Auth::routes();
Route::resource('users', 'UserController');
Route::get('/usersTrashed', 'UserController@indexTrashed')->name('usersTrashed');
Route::post('/userRestore', 'UserController@userRestore')->name('userRestore');
Route::resource('roles', 'RoleController');
Route::resource('permissions', 'PermissionController');
Route::get('/users/{id}/profileEdit', 'ProfileController@profileEdit')->name('profileEdit');
Route::put('/users/{id}/profileUpdate', 'ProfileController@profileUpdate')->name('profileUpdate');
Route::get('/lockedRecords', 'LockedRecordsController@index')->name('lockedRecords');
Route::delete('/unlockRecord/{id}', 'LockedRecordsController@unlockRecord')->name('unlockRecord');

//Excel Importing Routes
Route::get('/import', 'ImportController@index')->name('import');
Route::post('/importPipeline', 'ImportController@importPipeline');
Route::post('/importProcNeedsList', 'ImportController@importProcNeedsList');
Route::post('/importUwCondList', 'ImportController@importUwCondList');