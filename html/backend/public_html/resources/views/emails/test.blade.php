@extends('emails.layouts.default');
@section('content')
<p>Hi anhto,</p>
<p>Sometimes you just want to send a simple HTML email with a simple design and clear call to action. This is it.</p>
@include($buttonComponent, ['text' => 'Confirm your email', 'link' => 'https://iconnect.local/?v=123123123123'])
<p>This is a really simple email template. Its sole purpose is to get the recipient to click the button with no distractions.</p>
<p>Good luck! Hope it works.</p>
@endsection
