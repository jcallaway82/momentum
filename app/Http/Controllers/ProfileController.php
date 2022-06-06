<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\User;
use Auth;

//Enables us to output flash messaging
use Session;

class ProfileController extends Controller {

    public function __construct() {
        $this->middleware(['auth', 'authUser']);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function profileEdit($id) {
        $user = User::findOrFail($id); //Get user with specified id

        return view('users.profile', compact('user')); //pass user and roles data to view
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function profileUpdate(Request $request, $id) {
        $user = User::findOrFail($id); //Get role specified by id
        $data = $request->input();

        if($data['password'] == null) {
            //Validate name, email fields
            $this->validate($request, [
                'name' => 'required|max:120',
                'email' => 'required|email|unique:users,email,' . $id,
            ]);
        } else {
            //Validate name, email and password fields
            $this->validate($request, [
                'name' => 'required|max:120',
                'email' => 'required|email|unique:users,email,' . $id,
                'password'=>'required|min:6|confirmed'
            ]);
        }
        $input = $request->only(['name', 'email', 'password']); //Retreive the name, email and password fields
        $input = array_filter($input, 'strlen');

        $user->fill($input)->save();

        return redirect()->route('home')
            ->with('flash_message',
                'Profile successfully edited.');
    }
}