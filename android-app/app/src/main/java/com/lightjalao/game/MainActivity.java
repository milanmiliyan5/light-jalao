package com.lightjalao.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Display;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class MainActivity extends Activity {

    // Official Google test ad units. Replace these with Light Jalao production IDs before publishing.
    private static final String TEST_BANNER_ID = "ca-app-pub-3940256099942544/9214589741";
    private static final String TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";

    private WebView webView;
    private FrameLayout root;
    private FrameLayout adHolder;
    private FrameLayout splash;
    private AdView bannerAd;
    private volatile RewardedAd rewardedAd;
    private boolean pageReady = false;
    private boolean adsInitialized = false;
    private float targetRefreshRate = 60f;

    @Override
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setStatusBarColor(Color.rgb(18, 53, 74));
        window.setNavigationBarColor(Color.rgb(8, 28, 40));
        configureHighRefreshRate();

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(14, 43, 60));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(14, 43, 60));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setAlpha(0.01f);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setDefaultTextEncodingName("utf-8");
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " LightJalaoAndroid/1.1");

        webView.addJavascriptInterface(new AdsBridge(), "LightJalaoAds");
        webView.addJavascriptInterface(new NativeBridge(), "LightJalaoNative");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (!pageReady) {
                    pageReady = true;
                    revealGame();
                    initializeAdsAfterFirstPaint();
                }
            }
        });

        root.addView(
            webView,
            new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        );

        // Overlay the banner at the bottom so loading it never resizes the game WebView.
        adHolder = new FrameLayout(this);
        adHolder.setVisibility(View.GONE);
        adHolder.setBackgroundColor(Color.TRANSPARENT);
        FrameLayout.LayoutParams adHolderParams =
            new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
            );
        root.addView(adHolder, adHolderParams);

        splash = createSplash();
        root.addView(
            splash,
            new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        );

        setContentView(root);
        enterImmersiveMode();

        webView.loadUrl("file:///android_asset/www/index.html?native=1");
    }

    private FrameLayout createSplash() {
        FrameLayout layer = new FrameLayout(this);

        GradientDrawable bg = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[] {
                Color.rgb(28, 83, 108),
                Color.rgb(15, 50, 68),
                Color.rgb(8, 29, 41)
            }
        );
        layer.setBackground(bg);

        LinearLayout center = new LinearLayout(this);
        center.setOrientation(LinearLayout.VERTICAL);
        center.setGravity(Gravity.CENTER);
        center.setPadding(dp(24), dp(24), dp(24), dp(24));

        ImageView icon = new ImageView(this);
        icon.setImageResource(com.lightjalao.game.R.drawable.ic_launcher);
        LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dp(116), dp(116));
        iconParams.bottomMargin = dp(12);
        center.addView(icon, iconParams);

        TextView title = new TextView(this);
        title.setText("LIGHT JALAO");
        title.setTextColor(Color.WHITE);
        title.setTextSize(30);
        title.setGravity(Gravity.CENTER);
        title.setLetterSpacing(0.04f);
        center.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("CONNECT • POWER • GLOW");
        subtitle.setTextColor(Color.rgb(171, 228, 246));
        subtitle.setTextSize(10);
        subtitle.setGravity(Gravity.CENTER);
        subtitle.setLetterSpacing(0.12f);
        LinearLayout.LayoutParams subParams =
            new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
        subParams.topMargin = dp(8);
        center.addView(subtitle, subParams);

        TextView loading = new TextView(this);
        loading.setText("⚡ POWERING UP");
        loading.setTextColor(Color.rgb(255, 221, 99));
        loading.setTextSize(10);
        loading.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams loadParams =
            new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
        loadParams.topMargin = dp(26);
        center.addView(loading, loadParams);

        FrameLayout.LayoutParams centerParams =
            new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
            );
        layer.addView(center, centerParams);
        return layer;
    }

    private void revealGame() {
        webView.animate()
            .alpha(1f)
            .setDuration(320)
            .start();

        splash.postDelayed(() ->
            splash.animate()
                .alpha(0f)
                .setDuration(360)
                .withEndAction(() -> {
                    if (splash.getParent() == root) {
                        root.removeView(splash);
                    }
                })
                .start(),
            260
        );
    }

    private void initializeAdsAfterFirstPaint() {
        if (adsInitialized) return;
        adsInitialized = true;

        // Give the local offline game time to paint and settle first.
        root.postDelayed(() -> {
            if (isFinishing() || isDestroyed()) return;
            MobileAds.initialize(this, initializationStatus -> {
                loadBannerAd();
                loadRewardedAd();
            });
        }, 1400);
    }

    private void loadBannerAd() {
        if (isFinishing()) return;

        bannerAd = new AdView(this);
        bannerAd.setAdSize(AdSize.BANNER);
        bannerAd.setAdUnitId(TEST_BANNER_ID);
        bannerAd.setAdListener(new AdListener() {
            @Override
            public void onAdLoaded() {
                adHolder.setAlpha(0f);
                adHolder.setVisibility(View.VISIBLE);
                adHolder.animate().alpha(1f).setDuration(180).start();
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError error) {
                adHolder.setVisibility(View.GONE);
            }
        });

        FrameLayout.LayoutParams adParams =
            new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
            );
        adHolder.removeAllViews();
        adHolder.addView(bannerAd, adParams);
        bannerAd.loadAd(new AdRequest.Builder().build());
    }

    private void loadRewardedAd() {
        if (isFinishing()) return;

        RewardedAd.load(
            this,
            TEST_REWARDED_ID,
            new AdRequest.Builder().build(),
            new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull RewardedAd ad) {
                    rewardedAd = ad;
                    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            rewardedAd = null;
                            loadRewardedAd();
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            rewardedAd = null;
                            notifyJs("window.onNativeAdUnavailable && window.onNativeAdUnavailable()");
                            loadRewardedAd();
                        }
                    });
                    notifyJs("window.onNativeAdReady && window.onNativeAdReady()");
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError error) {
                    rewardedAd = null;
                    notifyJs("window.onNativeAdUnavailable && window.onNativeAdUnavailable()");
                }
            }
        );
    }

    private void showRewardedHint() {
        RewardedAd ad = rewardedAd;
        if (ad == null) {
            notifyJs("window.onNativeAdUnavailable && window.onNativeAdUnavailable()");
            loadRewardedAd();
            return;
        }

        rewardedAd = null;
        ad.show(this, rewardItem ->
            notifyJs("window.onNativeHintReward && window.onNativeHintReward()")
        );
    }

    private void notifyJs(String script) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(script, null));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private class AdsBridge {
        @JavascriptInterface
        public boolean isRewardedReady() {
            return rewardedAd != null;
        }

        @JavascriptInterface
        public void showRewardedHint() {
            runOnUiThread(MainActivity.this::showRewardedHint);
        }
    }

    private class NativeBridge {
        @JavascriptInterface
        public float getTargetRefreshRate() {
            return targetRefreshRate;
        }

        @JavascriptInterface
        public void vibrate(String pattern) {
            if (pattern == null || pattern.trim().isEmpty()) return;

            String[] parts = pattern.split(",");
            long[] timings = new long[parts.length];

            try {
                for (int i = 0; i < parts.length; i++) {
                    timings[i] = Math.max(0L, Long.parseLong(parts[i].trim()));
                }
            } catch (NumberFormatException ignored) {
                return;
            }

            Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (vibrator == null || !vibrator.hasVibrator()) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (timings.length == 1) {
                    vibrator.vibrate(
                        VibrationEffect.createOneShot(
                            Math.max(1L, timings[0]),
                            VibrationEffect.DEFAULT_AMPLITUDE
                        )
                    );
                } else {
                    long[] waveform = new long[timings.length + 1];
                    waveform[0] = 0L;
                    System.arraycopy(timings, 0, waveform, 1, timings.length);
                    vibrator.vibrate(VibrationEffect.createWaveform(waveform, -1));
                }
            } else {
                if (timings.length == 1) {
                    vibrator.vibrate(Math.max(1L, timings[0]));
                } else {
                    long[] waveform = new long[timings.length + 1];
                    waveform[0] = 0L;
                    System.arraycopy(timings, 0, waveform, 1, timings.length);
                    vibrator.vibrate(waveform, -1);
                }
            }
        }
    }

    private void configureHighRefreshRate() {
        try {
            Display display = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                ? getDisplay()
                : getWindowManager().getDefaultDisplay();

            if (display == null) return;

            float highestRate = display.getRefreshRate();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Display.Mode currentMode = display.getMode();
                Display.Mode bestMode = currentMode;

                for (Display.Mode mode : display.getSupportedModes()) {
                    boolean sameResolution =
                        mode.getPhysicalWidth() == currentMode.getPhysicalWidth()
                            && mode.getPhysicalHeight() == currentMode.getPhysicalHeight();

                    if (sameResolution && mode.getRefreshRate() > bestMode.getRefreshRate()) {
                        bestMode = mode;
                    }
                }

                WindowManager.LayoutParams params = getWindow().getAttributes();
                params.preferredDisplayModeId = bestMode.getModeId();
                params.preferredRefreshRate = bestMode.getRefreshRate();
                getWindow().setAttributes(params);
                highestRate = bestMode.getRefreshRate();
            } else {
                WindowManager.LayoutParams params = getWindow().getAttributes();
                params.preferredRefreshRate = highestRate;
                getWindow().setAttributes(params);
            }

            targetRefreshRate = highestRate;
        } catch (Throwable ignored) {
            targetRefreshRate = 60f;
        }
    }

    private void enterImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        if (bannerAd != null) bannerAd.resume();
        configureHighRefreshRate();
        enterImmersiveMode();
    }

    @Override
    protected void onPause() {
        if (bannerAd != null) bannerAd.pause();
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (bannerAd != null) bannerAd.destroy();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
