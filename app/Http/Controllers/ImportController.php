<?php

namespace App\Http\Controllers;

use Input;
use App;
use DB;
use Excel;
use Validator;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFoundException;

class ImportController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware(['auth', 'clearance']);
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('import');
    }

    public function importPipeline()
    {
        ini_set("xdebug.var_display_max_depth", 50);

        $users = App\User::all();
        $managers = [];
        foreach($users as $user) {
            if($user->hasRole('Admin') || $user->hasRole('Manager')) {
                array_push($managers, $user);
            }
        }

        if(Input::hasFile('import_file')){
            $path = Input::file('import_file')->getRealPath();
            $isError = false;
            $data = Excel::selectSheets('Data')->load($path, function($reader) use(&$isError) {
                $rs=$reader->get();
                $line0 = $rs[0];
                $headers = $line0->keys();
                //echo dd($headers->toArray());
                $validHeaders = [
                    'loan_number',
                    'borrower_name',
                    'loan_purpose',
                    'loan_type',
                    'loan_term',
                    'note_rate',
                    'core_milestone',
                    'lock_request_status',
                    'closing_disclosure_sent_date',
                    'closing_disclosure_received_date',
                    'loan_officer',
                    'lo_assistant_1',
                    'loan_processor',
                    'underwriter_name',
                    'loan_closer',
                    'funder_name',
                    'application_date',
                    'est_closing_date',
                    'subject_property_address',
                    'subject_property_city',
                    'subject_property_state',
                    'subject_property_zip',
                    'subject_property_county',
                    'subject_property_purchase_price',
                    'total_loan_amount',
                    'borrower_first_name',
                    'borrower_last_name',
                    'borr_email',
                    'borr_home_phone',
                    'borr_cell',
                    'co_borrower_first_name',
                    'co_borrower_last_name',
                    'co_borr_email',
                    'co_borr_home_phone',
                    'co_borr_cell',
                    'buyers_agent_name',
                    'buyers_agent_contact_name',
                    'buyers_agent_email',
                    'buyers_agent_phone',
                    'sellers_agent_name',
                    'sellers_agent_contact_name',
                    'sellers_agent_email',
                    'sellers_agent_phone',
                    'title_insurance_company_name',
                    'title_co_contact',
                    'title_co_phone'
                    ];
                if ($headers->toArray() !== $validHeaders) {
                    $isError = true;
                }
            })->toArray();

            if ($isError) {
                return redirect('import')
                    ->withErrors('Invalid file. The column headers do not match.')
                    ->withInput();
            }

            $i = 0;
            foreach($data as $loan) {
                if($loan['lo_assistant_1'] == ' ') {
                    $data[$i]['lo_assistant_1'] = null;
                }
                if($loan['loan_processor'] == ' ') {
                    $data[$i]['loan_processor'] = null;
                }
                if($loan['underwriter_name'] == ' ') {
                    $data[$i]['underwriter_name'] = null;
                }
                if($loan['loan_closer'] == ' ') {
                    $data[$i]['loan_closer'] = null;
                }
                if($loan['funder_name'] == ' ') {
                    $data[$i]['funder_name'] = null;
                }
                $data[$i]['tm_setup'] = null;
                $i++;
            }

            $validator = Validator::make($data, [
                '*.loan_number' => 'required|numeric',
                '*.borrower_name' => 'required|string',
                '*.loan_type' => 'required|string',
                '*.loan_purpose' => 'required|string',
                '*.loan_term' => 'required|numeric',
                '*.note_rate' => 'required|numeric',
                '*.core_milestone' => 'required|in:Started,Qualification,Processing,Submittal,Cond. Approval,Resubmittal,Approval,Ready for Docs,Docs Out,Docs Signing,Funding,Shipping,Purchased,Reconciled,Completion,Doc Preparation,Post Closing',
                '*.lock_request_status' => 'required|string',
                '*.closing_disclosure_sent_date' => ['nullable','regex:/[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/'],
                '*.closing_disclosure_received_date' => ['nullable','regex:/[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/'],
                '*.loan_officer' => 'required|string',
                '*.lo_assistant_1' => 'nullable|string',
                //'*.loan_team_member_name_setup' => 'nullable|string',
                '*.loan_processor' => 'nullable|string',
                '*.underwriter_name' => 'nullable|string',
                '*.loan_closer' => 'nullable|string',
                '*.funder_name' => 'nullable|string',
                '*.application_date' =>  ['required','regex:/[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/'],
                '*.est_closing_date' => ['required','regex:/[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/'],
                '*.subject_property_address' => 'required|string',
                '*.subject_property_city' => 'required|string',
                '*.subject_property_state' => 'required|string',
                '*.subject_property_zip' => 'required|string',
                '*.subject_property_county' => 'required|string',
                '*.subject_property_purchase_price' => 'required|numeric',
                '*.total_loan_amount' => 'required|numeric',
                /* file contact fields not added */
            ]);

            if ($validator->fails()) {
                return redirect('import')
                    ->withErrors($validator)
                    ->withInput();
            }

            if(!empty($data)){
                DB::beginTransaction();

                try {
                    App\Loan::where('milestone','!=', 'Inactive')
                        ->where('new_import','=','Y')
                        ->update(['new_import' => 'N']);
                    DB::table('loan_user')->truncate();
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return redirect('import')
                        ->withErrors($e->getMessage())
                        ->withInput();
                }

                try {
                    foreach ($data as $loan) {
                        $insertLoan = App\Loan::updateOrCreate([
                            'loan_id' => $loan['loan_number']
                        ], [
                            'loan_id' => $loan['loan_number'],
                            'borrower_name' => $loan['borrower_name'],
                            'loan_type' => $loan['loan_type'],
                            'loan_term' => $loan['loan_term'],
                            'note_rate' => $loan['note_rate'],
                            'loan_purpose' => $loan['loan_purpose'],
                            'milestone' => $loan['core_milestone'],
                            'lock_status' => $loan['lock_request_status'],
                            'cd_sent_date' => $loan['closing_disclosure_sent_date'],
                            'cd_received_date' => $loan['closing_disclosure_received_date'],
                            'tm_loan_officer' => $loan['loan_officer'],
                            'tm_lo_assistant' => $loan['lo_assistant_1'],
                            'tm_setup' => $loan['tm_setup'],
                            'tm_loan_processor' => $loan['loan_processor'],
                            'tm_underwriter' => $loan['underwriter_name'],
                            'tm_closer' => $loan['loan_closer'],
                            'tm_funder' => $loan['funder_name'],
                            'application_date' => $loan['application_date'],
                            'scheduled_closing_date' => $loan['est_closing_date'],
                            'subject_property_address' => $loan['subject_property_address'],
                            'subject_property_city' => $loan['subject_property_city'],
                            'subject_property_state' => $loan['subject_property_state'],
                            'subject_property_zip' => $loan['subject_property_zip'],
                            'subject_property_county' => $loan['subject_property_county'],
                            'subject_property_purchase_price' => $loan['subject_property_purchase_price'],
                            'loan_amount' => $loan['total_loan_amount'],
                            'borr_first_name' => $loan['borrower_first_name'],
                            'borr_last_name' => $loan['borrower_last_name'],
                            'borr_email' => $loan['borr_email'],
                            'borr_home_phone' => $loan['borr_home_phone'],
                            'borr_cell' => $loan['borr_cell'],
                            'coBorr_first_name' => $loan['co_borrower_first_name'],
                            'coBorr_last_name' => $loan['co_borrower_last_name'],
                            'coBorr_email' => $loan['co_borr_email'],
                            'coBorr_home_phone' => $loan['co_borr_home_phone'],
                            'coBorr_cell' => $loan['co_borr_cell'],
                            'buyers_agent_name' => $loan['buyers_agent_name'],
                            'buyers_agent_contact_name' => $loan['buyers_agent_contact_name'],
                            'buyers_agent_email' => $loan['buyers_agent_email'],
                            'buyers_agent_phone' => $loan['buyers_agent_phone'],
                            'sellers_agent_name' => $loan['sellers_agent_name'],
                            'sellers_agent_contact_name' => $loan['sellers_agent_contact_name'],
                            'sellers_agent_email' => $loan['sellers_agent_email'],
                            'sellers_agent_phone' => $loan['sellers_agent_phone'],
                            'title_co_name' => $loan['title_insurance_company_name'],
                            'title_co_contact' => $loan['title_co_contact'],
                            'title_co_phone' => $loan['title_co_phone'],
                            'new_import' => 'Y',
                        ]);

                        // create array of team members
                        $associatedUsers = [
                            $loan['loan_officer'],
                            $loan['lo_assistant_1'],
                            $loan['tm_setup'],
                            $loan['loan_processor'],
                            $loan['underwriter_name'],
                            $loan['loan_closer'],
                            $loan['funder_name'],
                        ];

                        // loop through managers and assign all loans
                        foreach($managers as $manager) {
                            if(!$insertLoan->users()->where('user_id', '=', $manager['id'])->exists()) {
                                $insertLoan->users()->attach($manager['id']);
                            }
                        }

                        // loop through remaining team members and associate loan to them
                        foreach($associatedUsers as $au) {
                            if($au) {
                                $assocUser = App\User::where('name', '=', $au)->first();
                                //if($assocUser && !$assocUser->hasRole('Admin')) {
                                if($assocUser && !$assocUser->hasRole('Manager')) {
                                    if(!$insertLoan->users()->where('user_id', '=', $assocUser['id'])->exists()) {
                                        $insertLoan->users()->attach($assocUser['id']);
                                    }
                                }
                            }
                        }

                        if(!App\ProcessorWorksheet::where('loan_id', '=', $insertLoan['id'])->exists()) {
                            $processorWorksheet = new App\ProcessorWorksheet;
                            $insertLoan->processorWorksheet()->save($processorWorksheet);
                        }

                        if(!App\OfficerWorksheet::where('loan_id', '=', $insertLoan['id'])->exists()) {
                            $officerWorksheet = new App\OfficerWorksheet;
                            $insertLoan->officerWorksheet()->save($officerWorksheet);
                        }

                        if(!App\Borrower::where('loan_id', '=', $insertLoan['id'])->exists()) {
                            $borrower = new App\Borrower;
                            $insertLoan->borrower()->save($borrower);
                        }
                    }
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return redirect('import')
                        ->withErrors($e->getMessage())
                        ->withInput();
                }

                try {
                    App\Loan::where('new_import', '=', 'N')
                        ->update(['milestone' => 'Inactive']);
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return redirect('import')
                        ->withErrors($e->getMessage())
                        ->withInput();
                }

                DB::commit();
            }
        }
        return redirect()->route('import')
            ->with('flash_message',
                'File successfully imported.');
    }

    public function importProcNeedsList(Request $request) {
        $loan = App\Loan::find(Input::get('loan_id'));

        if(Input::hasFile('procNeedsList')){
            $path = Input::file('procNeedsList')->getRealPath();
            $isError = false;
            $data = Excel::selectSheets('Data')->load($path, function($reader) use(&$isError) {
                $rs=$reader->get();
                $line0 = $rs[0];
                $headers = $line0->keys();
                $validHeaders = [
                    'name',
                    'description',
                    'status'
                    ];
                if ($headers->toArray() !== $validHeaders) {
                    $isError = true;
                }
            })->toArray();

            if ($isError) {
                return response()->json([
                    'messages' => 'There was an error verifying the columns.'
                ], 403);

            }

            $validator = Validator::make($data, [
                '*.name' => 'required|string',
                '*.description' => 'sometimes|string',
                '*.status' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'messages' => $validator->getMessage()
                ], 403);
            }

            if(!empty($data)){
                DB::beginTransaction();

                try {
                    App\ProcNeedList::where('loan_id','=', $loan['id'])
                        ->where('new_import','=','Y')
                        ->update(['new_import' => 'N']);
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return redirect('import')
                        ->withErrors($e->getMessage())
                        ->withInput();
                }

                try {
                    foreach ($data as $item) {
                        $needsList = App\ProcNeedList::where([
                            ['name', '=', $item['name']],
                            ['description', '=', $item['description']],
                            ['loan_id', '=', $loan['id']]])->first();

                        if(!$needsList) {
                            $needsList = new App\ProcNeedList;
                        }

                        $needsList->name = $item['name'];
                        $needsList->description = $item['description'];
                        $needsList->status = $item['status'];
                        $needsList->new_import = 'Y';

                        $loan->procNeedList()->save($needsList);
                    }
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return response()->json([
                        'messages' => $e->getMessage()
                    ], 403);
                }

                DB::commit();
            }
        }

        $updatedList = $loan->procNeedList()->where('new_import', '=', 'Y')->get();

        return response()->json([
            'data' => $updatedList,
            'messages' => 'Needs list successfully imported'
        ], 200);
    }

    public function importUwCondList(Request $request) {
        $loan = App\Loan::find(Input::get('loan_id'));

        if(Input::hasFile('uwCondList')){
            $path = Input::file('uwCondList')->getRealPath();
            $isError = false;
            $data = Excel::selectSheets('Data')->load($path, function($reader) use(&$isError) {
                $rs=$reader->get();
                $line0 = $rs[0];
                $headers = $line0->keys();
                $validHeaders = [
                    'documents',
                    'name',
                    'description',
                    'prior_to',
                    'status'
                ];
                if ($headers->toArray() !== $validHeaders) {
                    $isError = true;
                }
            })->toArray();

            if ($isError) {
                return response()->json([
                    'messages' => 'There was an error verifying the columns.'
                ], 403);

            }

            $validator = Validator::make($data, [
                '*.name' => 'required|string',
                '*.description' => 'sometimes|string',
                '*.prior_to' => 'required|string',
                '*.status' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'messages' => $validator->getMessage()
                ], 403);
            }

            if(!empty($data)){
                DB:: beginTransaction();

                try {
                    App\UWCondition::where('loan_id','=', $loan['id'])
                        ->where('new_import','=','Y')
                        ->update(['new_import' => 'N']);
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return redirect('import')
                        ->withErrors($e->getMessage())
                        ->withInput();
                }

                try {
                    foreach ($data as $item) {
                        $condList = App\UWCondition::where([
                            ['name', '=', $item['name']],
                            ['description', '=', $item['description']],
                            ['loan_id', '=', $loan['id']]])->first();

                        if(!$condList) {
                            $condList = new App\UWCondition;
                        }

                        $condList->name = $item['name'];
                        $condList->description = $item['description'];
                        $condList->prior_to = $item['prior_to'];
                        $condList->status = $item['status'];
                        $condList->new_import = 'Y';

                        $loan->uwCondition()->save($condList);
                    }
                } catch(\Exception $e)
                {
                    DB::rollback();
                    return response()->json([
                        'messages' => $e->getMessage()
                    ], 403);
                }

                DB::commit();
            }
        }

        $updatedList = $loan->uwCondition()->where('new_import', '=', 'Y')->get();

        return response()->json([
            'data' => $updatedList,
            'messages' => 'Condition list successfully imported'
        ], 200);
    }
}