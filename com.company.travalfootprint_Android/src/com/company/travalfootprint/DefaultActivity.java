package com.company.travalfootprint;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;
import com.company.travalfootprint.*;

public class DefaultActivity extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
		super.setIntegerProperty( "splashscreen", R.drawable.splash );
		super.loadUrl("file:///android_asset/www/index.html", 1000);
    }
}