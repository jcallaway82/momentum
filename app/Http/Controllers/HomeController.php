<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Loan;
use DateTimeImmutable;
use DB;


class HomeController extends Controller
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
    public function index() {
        //ini_set("xdebug.var_display_max_depth", 50);
        /*$loans = Loan::where('milestone','!=', 'Inactive')->get();
        var_dump($loans);
        die();*/

        $data = Loan::getLoans();

        return view('home', compact('data'));
    }

    public function getActiveLoans() {

        $data = Loan::getLoans();

        return response()->json([
            'messages' => 'Success',
            'loans' => $data['loans'],
            'procWorksheets' => $data['procWorksheets'],
            'loanOfficers' => $data['loanOfficers'],
            'loanProcessors' => $data['loanProcessors'],
            'filters' => $data['filters']
        ], 200);
    }

    public function getProcWorksheets() {
        $user = Auth::user();
        $loans = $user->loans()->get();
        $procWorksheets = [];

        foreach($loans as $loan) {
            $procWorksheets[] = $loan->processorWorksheet()->get();
            $loanOfficers[$loan['tm_loan_officer']] = $loan['tm_loan_officer'];
            if($loan['tm_loan_processor'] == null) {
                $loanProcessors['null'] = 'Not Assigned';
            } else {
                $loanProcessors[$loan['tm_loan_processor']] = $loan['tm_loan_processor'];
            }

        }

        return response()->json([
            'messages' => 'Updated Processor Worksheets',
            'procWorksheets' => $procWorksheets,
        ], 200);
    }

    public function updateLoan(Request $request) {
        $data = $request->input('data');
        try {
            $loan = Loan::findOrFail($data['item_id']);

            if ($data['column'] == 'actual_closing_date') {
                $actual_closing_date = new DateTimeImmutable($data['value']);
                $docs_out_date = $actual_closing_date->modify("-1 days");
                $cd_closing_date = $actual_closing_date->modify("-4 days");
                $le_locked_resub_date = $actual_closing_date->modify("-7 days");
                $initial_uw_date = $actual_closing_date->modify("-10 days");
                $processing_date = $actual_closing_date->modify("-19 days");
                //$setup_date = $actual_closing_date->modify("-19 days");
                $qualification_date = $actual_closing_date->modify("-20 days");
                $dates = [
                    'actual_closing_date' => $actual_closing_date->format('Y-m-d'),
                    'docs_out_date' => $docs_out_date->format('Y-m-d'),
                    'cd_closing_date' => $cd_closing_date->format('Y-m-d'),
                    'le_locked_resub_date' => $le_locked_resub_date->format('Y-m-d'),
                    'initial_uw_date' => $initial_uw_date->format('Y-m-d'),
                    'processing_date' => $processing_date->format('Y-m-d'),
                    //'setup_date' => $setup_date->format('Y-m-d'),
                    'qualification_date' => $qualification_date->format('Y-m-d')
                ];
                $loan->fill($dates);
                $loan->save();
            } else {
                $loan->update([$data['column'] => $data['value']]);
                $loan->save();
            }

            $user = Auth::user();
            $loans = $user->loans()->where('milestone','!=', 'Inactive')->get();

            return response()->json([
                'messages' => 'Loan successfully updated',
                'loans' => $loans,
            ], 200);

        } catch (ModelNotFoundException $ex) {
            return response()->json([
                'messages' => $ex->getMessage()
            ], 403);
        }
    }
}
