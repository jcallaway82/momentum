@extends('layouts.app')

@section('content')
<style>
    .container{
        margin: 0 auto;
    }
    .login{
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 50px 0 0 -250px;
        width: 450px;
    }
    .login-heading{
        font: 1.8em/48px 'Tenor Sans', sans-serif;
        color: #5D92BA;
    }

    .input-txt{
        width: 100%;
        padding: 20px 10px;
        background: white;
        border: none;
        font-size: 1em;
        color: #5D92BA;
        border-bottom: 1px dotted rgba(93, 146, 186, .4);
        box-sizing: border-box;
        transition: background-color .5s ease-in-out;
        focus: background-color white, 10%;
    }

    .login-footer > a {
        margin: 10px 0;
        color: #5D92BA;
        overlow: hidden;
        float: left;
        width: 100%;
    }
    .btn{
        padding: 15px 30px;
        border: none;
        background: #5D92BA;
        color: white;
    }
    .btn--right{
        float: right;
    }
    .icon{
        display: inline-block;
    }
    .icon--min{
        font-size: .9em;
    }
    .lnk{
        font-size: .8em;
        line-height: 3em;
        color: white;
        text-decoration: none;
    }
</style>
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="container">
                <div class="login">
                    <h1 class="login-heading">
                        <strong>Welcome.</strong> Please login.</h1>
                    <form method="POST" action="{{ route('login') }}">
                        {{ csrf_field() }}
                        <input id="email" type="email" class="input-txt" name="email" placeholder="Username" value="{{ old('email') }}" required autofocus>
                        @if ($errors->has('email'))
                            <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                        @endif

                        <input id="password" type="password" class="input-txt" name="password" placeholder="Password" required>
                        @if ($errors->has('password'))
                            <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                        @endif

                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}> Remember Me
                            </label>
                        </div>
                        <div style="display: inline-block">
                            <button type="submit" class="btn btn-primary">
                                Login
                            </button>

                            <a class="btn btn-link" href="{{ route('password.request') }}">
                                Forgot Your Password?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            {{--<div class="panel panel-default">
                <div class="panel-heading">Login</div>

                <div class="panel-body">
                    <form class="form-horizontal" method="POST" action="{{ route('login') }}">
                        {{ csrf_field() }}

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <label for="email" class="col-md-4 control-label">E-Mail Address</label>

                            <div class="col-md-6">
                                <input id="email" type="email" class="form-control" name="email" value="{{ old('email') }}" required autofocus>

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <label for="password" class="col-md-4 control-label">Password</label>

                            <div class="col-md-6">
                                <input id="password" type="password" class="form-control" name="password" required>

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-4">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}> Remember Me
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-8 col-md-offset-4">
                                <button type="submit" class="btn btn-primary">
                                    Login
                                </button>

                                <a class="btn btn-link" href="{{ route('password.request') }}">
                                    Forgot Your Password?
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>--}}
        </div>
    </div>
</div>
@endsection
