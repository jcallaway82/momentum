<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Loan;
use App\Reo;

class ReoController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware(['auth', 'clearance']);
    }

    public function addREO(Request $request) {
        $data = $request->input('data');

        $loan = Loan::find($data['loan']);
        $reo = new Reo;
        $loan->reo()->save($reo);

        return $loan->reo()->get();
    }

    public function deleteREO(Request $request) {
        $data = $request->input('data');

        Reo::destroy($data['reo']);

        $loan = Loan::find($data['loan']);
        return $loan->reo()->get();
    }
}
