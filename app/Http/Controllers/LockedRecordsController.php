<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Auth;
use DB;

use Spatie\Permission\Models\Permission;

use Session;

class LockedRecordsController extends Controller {

    public function __construct() {
        $this->middleware(['auth', 'clearance']); //isAdmin middleware lets only users with a //specific permission permission to access these resources
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() {
        $records = DB::table('recordLocks')
            ->join('loans', 'recordLocks.rowID', '=', 'loans.id')
            ->select(
                'loans.borrower_name',
                'recordLocks.tableName',
                'recordLocks.lockDateTime',
                'recordLocks.lockUser',
                'recordLocks.rowID')
            ->get();

        return view('lockedRecords')->with('records', $records);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function unlockRecord($id) {
        DB::table('recordLocks')
            ->where('rowID', '=', $id)
            ->delete();

        return redirect()->route('lockedRecords')
            ->with('flash_message',
                'Record unlocked!');

    }
}