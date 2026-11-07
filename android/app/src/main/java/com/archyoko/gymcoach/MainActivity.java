package com.archyoko.gymcoach;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ZeppBridge.class);
        registerPlugin(WatchDirect.class);
        super.onCreate(savedInstanceState);
        // حجم الخط الكبير في إعدادات الموبايل كان بيكبّر الكلام ويخليه يركب على بعض
        try { getBridge().getWebView().getSettings().setTextZoom(100); } catch (Exception ignored) { }
    }
}
