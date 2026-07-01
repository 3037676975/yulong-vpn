package cn.yulong.vpn;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.VpnService;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int VPN_REQUEST = 1001;
    private WebView webView;
    private final Handler main = new Handler(Looper.getMainLooper());
    private JSONObject pendingNode;
    private SharedPreferences prefs;

    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        prefs = getSharedPreferences("yulong", MODE_PRIVATE);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new Bridge(), "YulongAndroid");
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void callback(String fn, JSONObject payload){
        main.post(() -> webView.evaluateJavascript("window." + fn + " && window." + fn + "(" + JSONObject.quote(payload.toString()) + ")", null));
    }

    private String request(String method, String path, JSONObject body) throws Exception{
        URL url = new URL("https://yulong-vpn-git-main-3037676975s-projects.vercel.app" + path);
        HttpURLConnection c = (HttpURLConnection) url.openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(12000);
        c.setReadTimeout(30000);
        c.setRequestProperty("content-type", "application/json; charset=utf-8");
        if(body != null){
            c.setDoOutput(true);
            byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
            OutputStream os = c.getOutputStream(); os.write(bytes); os.flush(); os.close();
        }
        int code = c.getResponseCode();
        BufferedReader br = new BufferedReader(new InputStreamReader(code >= 400 ? c.getErrorStream() : c.getInputStream(), StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(); String line;
        while((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }

    private String clientId(){
        String id = prefs.getString("clientId", null);
        if(id == null){ id = "and-" + System.currentTimeMillis() + "-" + Math.round(Math.random()*100000); prefs.edit().putString("clientId", id).apply(); }
        return id;
    }

    private JSONObject saved(){
        JSONObject j = new JSONObject();
        try{
            j.put("clientId", clientId());
            j.put("verified", prefs.getBoolean("verified", false));
            j.put("expiresAt", prefs.getString("expiresAt", ""));
            j.put("connected", prefs.getBoolean("connected", false));
            j.put("node", prefs.getString("node", ""));
        }catch(Exception ignored){}
        return j;
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data){
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == VPN_REQUEST && resultCode == RESULT_OK && pendingNode != null){ startVpn(pendingNode); }
        else callback("onAndroidConnect", error("用户取消了 VPN 授权"));
    }

    private JSONObject error(String msg){ try{ return new JSONObject().put("ok", false).put("message", msg); }catch(Exception e){ return new JSONObject(); } }

    private void startVpn(JSONObject node){
        try{
            Intent i = new Intent(this, YulongVpnService.class);
            i.putExtra("host", node.optString("server", node.optString("host", "")));
            i.putExtra("port", node.optInt("port", 443));
            i.putExtra("name", node.optString("name", "节点"));
            startService(i);
            prefs.edit().putBoolean("connected", true).putString("node", node.toString()).apply();
            callback("onAndroidConnect", new JSONObject().put("ok", true).put("message", "已连接").put("node", node));
        }catch(Exception e){ callback("onAndroidConnect", error(e.getMessage())); }
    }

    public class Bridge {
        @JavascriptInterface public String state(){ return saved().toString(); }
        @JavascriptInterface public void config(){
            new Thread(() -> { try{ callback("onAndroidConfig", new JSONObject(request("GET", "/api/config", null))); }catch(Exception e){ callback("onAndroidConfig", error(e.getMessage())); } }).start();
        }
        @JavascriptInterface public void verify(String code){
            new Thread(() -> {
                try{
                    JSONObject body = new JSONObject().put("code", code).put("clientId", clientId()).put("pluginVersion", "android-1.0.0");
                    JSONObject r = new JSONObject(request("POST", "/api/access-code", body));
                    if(r.optBoolean("ok")) prefs.edit().putBoolean("verified", true).putString("expiresAt", r.optString("expiresAt", "")).apply();
                    callback("onAndroidVerify", r);
                }catch(Exception e){ callback("onAndroidVerify", error(e.getMessage())); }
            }).start();
        }
        @JavascriptInterface public void backendCheck(){
            new Thread(() -> { try{ callback("onAndroidCheck", new JSONObject(request("POST", "/api/plugin-node-test-all", new JSONObject()))); }catch(Exception e){ callback("onAndroidCheck", error(e.getMessage())); } }).start();
        }
        @JavascriptInterface public void record(String event, String nodeName){
            new Thread(() -> { try{ request("POST", "/api/client-stats", new JSONObject().put("clientId", clientId()).put("event", event).put("pluginVersion", "android-1.0.0").put("nodeName", nodeName)); }catch(Exception ignored){} }).start();
        }
        @JavascriptInterface public void connect(String nodeJson){
            try{
                JSONObject node = new JSONObject(nodeJson);
                pendingNode = node;
                Intent prepare = VpnService.prepare(MainActivity.this);
                if(prepare != null) startActivityForResult(prepare, VPN_REQUEST); else startVpn(node);
            }catch(Exception e){ callback("onAndroidConnect", error(e.getMessage())); }
        }
        @JavascriptInterface public void disconnect(){
            try{
                Intent i = new Intent(MainActivity.this, YulongVpnService.class);
                i.setAction(YulongVpnService.ACTION_DISCONNECT);
                startService(i);
                prefs.edit().putBoolean("connected", false).putString("node", "").apply();
                callback("onAndroidDisconnect", new JSONObject().put("ok", true).put("message", "已断开"));
            }catch(Exception e){ callback("onAndroidDisconnect", error(e.getMessage())); }
        }
    }
}
