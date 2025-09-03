package com.rahultushar.anar;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import android.view.WindowManager;
import android.graphics.Color;
import android.view.View;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Disable screenshots
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE);

        // Set status bar color
        getWindow().setStatusBarColor(Color.parseColor("#8557B6"));

        webView = new WebView(this);
        setContentView(webView);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setDomStorageEnabled(true);

        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // Prevent long-press (disable text selection / context menu)
        webView.setOnLongClickListener(v -> true);
        webView.setLongClickable(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Inject CSS to remove link highlight (blue tap color)
                String removeTapHighlight = "document.querySelectorAll('*').forEach(el => {" +
                        "el.style.webkitTapHighlightColor='transparent';" +
                        "});";
                webView.evaluateJavascript(removeTapHighlight, null);
            }
        });

        webView.loadUrl("https://rahultushar-git.github.io/anar/");
    }

    @Override
    public void onBackPressed() {
        // Enable back button navigation inside WebView
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

