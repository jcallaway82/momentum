<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Loan;
use App\ProcessorWorksheet;
use App\OfficerWorksheet;
use App\Borrower;
use App\ProcNeedList;
use App\UWCondition;
use App\Reo;
use App\Comment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LoanDetailController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function getLoanDetail($loanID, $tabKey, $notesField)
    {
        $item = Loan::findOrFail($loanID);
        $officerWorksheet = $item->officerWorksheet()->get();
        $processorWorksheet = $item->processorWorksheet()->get();
        $reos = $item->reo()->get();
        $borrowers = $item->borrower()->get();
        $comments = Comment::with(['reply'])->where([
            ['loan_id', '=', $loanID],
            ['procNeedList_id', '=', null],
            ['uwCondition_id', '=', null]
        ])->get();
        $procNeedsList = $item->procNeedList()->where('new_import', '=', 'Y')->get();
        $procNeedsListComments = Comment::with(['reply'])->where([
            ['loan_id', '=', $loanID],
            ['procNeedList_id', '!=', null]
        ])->get();
        $uwCondList = $item->uwCondition()->where('new_import', '=', 'Y')->get();
        $uwCondListComments = Comment::with(['reply'])->where([
            ['loan_id', '=', $loanID],
            ['uwCondition_id', '!=', null]
        ])->get();

        $loanInfo = ([
            'type' => $item['loan_type'],
            'purpose' => $item['loan_purpose'],
            'closing_date' => $item['actual_closing_date']
        ]);

        $fileContacts = [
            'borr_first_name' => $item['borr_first_name'],
            'borr_last_name' => $item['borr_last_name'],
            'borr_email' => $item['borr_email'],
            'borr_home_phone' => $item['borr_home_phone'],
            'borr_cell' => $item['borr_cell'],
            'coBorr_first_name' => $item['coBorr_first_name'],
            'coBorr_last_name' => $item['coBorr_last_name'],
            'coBorr_email' => $item['coBorr_email'],
            'coBorr_home_phone' => $item['coBorr_home_phone'],
            'coBorr_cell' => $item['coBorr_cell'],
            'buyers_agent_name' => $item['buyers_agent_name'],
            'buyers_agent_contact_name' => $item['buyers_agent_contact_name'],
            'buyers_agent_email' => $item['buyers_agent_email'],
            'buyers_agent_phone' => $item['buyers_agent_phone'],
            'sellers_agent_name' => $item['sellers_agent_name'],
            'sellers_agent_contact_name' => $item['sellers_agent_contact_name'],
            'sellers_agent_email' => $item['sellers_agent_email'],
            'sellers_agent_phone' => $item['sellers_agent_phone'],
            'title_co_name' => $item['title_co_name'],
            'title_co_contact' => $item['title_co_contact'],
            'title_co_phone' => $item['title_co_phone'],
        ];

        $users = DB::table('users')->select('name')->where('deleted_at', '=', null)->get()->toArray();
        $returnUsers = [];
        foreach($users as $user) {
            array_push($returnUsers, $user->name);
        }

        $data = [];
        $data = array_add($data, 'officerWorksheet', $officerWorksheet);
        $data = array_add($data, 'processorWorksheet', $processorWorksheet);
        $data = array_add($data, 'borrowers', $borrowers);
        $data = array_add($data, 'reos', $reos);
        $data = array_add($data, 'loanInfo', $loanInfo);
        $data = array_add($data, 'fileContacts', $fileContacts);
        $data = array_add($data, 'comments', $comments);
        $data = array_add($data, 'users', $returnUsers);
        $data = array_add($data, 'key', $tabKey);
        $data = array_add($data, 'notesField', $notesField);
        $data = array_add($data, 'procNeedsList', $procNeedsList);
        $data = array_add($data, 'procNeedsListComments', $procNeedsListComments);
        $data = array_add($data, 'uwCondList', $uwCondList);
        $data = array_add($data, 'uwCondListComments', $uwCondListComments);

        $teamMembers = [];
        $teamMembers = array_add($teamMembers, 'Loan Officer', $item['tm_loan_officer']);
        $teamMembers = array_add($teamMembers, 'Loan Assistant', $item['tm_lo_assistant']);
        $teamMembers = array_add($teamMembers, 'Setup', $item['tm_setup']);
        $teamMembers = array_add($teamMembers, 'Loan Processor', $item['tm_loan_processor']);
        $teamMembers = array_add($teamMembers, 'Underwriter', $item['tm_underwriter']);
        $teamMembers = array_add($teamMembers, 'Closer', $item['tm_closer']);
        $teamMembers = array_add($teamMembers, 'Funder', $item['tm_funder']);

        $allTeamMembers = [];
        $allTeamMembers = array_add($allTeamMembers, 'ImportUsers', $teamMembers);
        $allTeamMembers = array_add($allTeamMembers, 'SystemUsers', $returnUsers);

        //ini_set("xdebug.var_display_max_depth", 50);
        //var_dump($procNeedsListComments);
        //die();

        return view('loanDetail', compact('item','data', 'allTeamMembers'));
    }

    public function checkIfTaskLocked(Request $request) {
        $data = $request->input('data');

        $lock = DB::table('recordLocks')->where([
            ['rowID', '=', $data['loan_id']],
            ['tableName', '=', $data['table']]
        ])->first();

        if($lock) {
            return $lock->lockUser;
        } else {
            return null;
        }
    }

    public function lockTaskForEdit(Request $request) {
        $user = Auth::user();
        $date = date('Y-m-d H:i:s');
        $data = $request->input('data');

        DB::table('recordLocks')->insert([
            'tableName' => $data['table'],
            'rowID' => $data['loan_id'],
            'lockDateTime' => $date,
            'lockUser' => $user->name
        ]);
    }

    public function updateTask(Request $request) {
        $data = $request->input('data');
        $user = Auth::user();
        $lockedUser = DB::table('recordLocks')->where([
            ['tableName', $data['tableName']],
            ['rowID', $data['worksheet']['loan_id']]
        ])->value('lockUser');

        if($lockedUser === $user['name']) {
            if($data['tableName'] === 'processorWorksheets') {
                $worksheet = ProcessorWorksheet::where('loan_id', $data['worksheet']['loan_id'])->firstOrFail();

                foreach($data['reo'] as $reo) {
                    $updateReo = Reo::where('id', $reo['id'])->firstOrFail();
                    $updateReo->fill($reo);
                    $updateReo->save();
                }
            } elseif($data['tableName'] === 'officerWorksheets') {
                $worksheet = OfficerWorksheet::where('loan_id', $data['worksheet']['loan_id'])->firstOrFail();
            }

            $worksheet->fill($data['worksheet']);
            $worksheet->save();

            foreach($data['borrower'] as $borrower) {
                $updateBorrower = Borrower::where('id', $borrower['id'])->firstOrFail();
                $updateBorrower->fill($borrower);
                $updateBorrower->save();
            }

            DB::table('recordLocks')->where([
                ['tableName', $data['tableName']],
                ['rowID', $data['worksheet']['loan_id']]
            ])->delete();

            return response('Task successfully updated', 200);

        } else {
            return response()->json([
                'messages' => 'You are not authorized to edit this record.'
            ], 403);
        }
    }

    public function cancelUpdate(Request $request) {
        $data = $request->input('data');
        DB::table('recordLocks')->where([
            ['tableName', $data['tableName']],
            ['rowID', $data['loan_id']]
        ])->delete();
    }
}
