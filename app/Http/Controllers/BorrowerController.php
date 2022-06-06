<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Loan;
use App\Borrower;

class BorrowerController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function getBorrowers(Request $request) {
        $loan = Loan::find($request->input('loan_id'));
        $borrowers = $loan->borrower()->get();

        return $borrowers;
    }

    public function addBorrower(Request $request) {
        $data = $request->input('data');

        $loan = Loan::find($data['loan']);
        $borrower = new Borrower;
        $loan->borrower()->save($borrower);

        return $loan->borrower()->get();
    }

    public function deleteBorrower(Request $request) {
        $data = $request->input('data');

        Borrower::destroy($data['borrower']);

        $loan = Loan::find($data['loan']);
        return $loan->borrower()->get();
    }
}
