package cn.yulong.vpn;

import android.content.Intent;
import android.net.VpnService;
import android.os.Build;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class YulongVpnPlugin extends CordovaPlugin {
    private static final int VPN_REQUEST = 4701;
    private static final String[] API_BASES = new String[]{
            "https://yulong-vpn-three.vercel.app",
            "https://yulong-vpn-3037676975s-projects.vercel.app",
            "https://yulong-vpn-git-main-3037676975s-projects.vercel.app"
    };
    private JSONObject pendingNode;
    private CallbackContext pendingCallback;

    @Override public boolean execute(String action, JSONArray args, CallbackContext callback) {
        try {
            if ("api".equals(action)) {
                String method = args.optString(0, "GET");
                String path = args.optString(1, "/api/config");
                JSONObject body = args.optJSONObject(2);
                cordova.getThreadPool().execute(() -> {
                    try { ok(callback, new JSONObject(request(method, path, body))); }
                    catch (Exception e) { fail(callback, e.getMessage()); }
                });
                return true;
            }
            if ("startVpn".equals(action)) {
                pendingNode = args.optJSONObject(0);
                pendingCallback = callback;
                Intent prepare = VpnService.prepare(cordova.getActivity());
                if (prepare != null) {
                    cordova.setActivityResultCallback(this);
                    cordova.getActivity().startActivityForResult(prepare, VPN_REQUEST);
                } else {
                    startVpnNow();
                }
                return true;
            }
            if ("stopVpn".equals(action)) {
                Intent i = new Intent(cordova.getActivity(), YulongVpnService.class);
                i.setAction(YulongVpnService.ACTION_DISCONNECT);
                cordova.getActivity().startService(i);
                ok(callback, new JSONObject().put("ok", true).put("message", "已断开"));
                return true;
            }
            if ("state".equals(action)) {
                ok(callback, new JSONObject().put("ok", true).put("platform", "cordova-android"));
                return true;
            }
        } catch (Exception e) {
            fail(callback, e.getMessage());
            return true;
        }
        return false;
    }

    @Override public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == VPN_REQUEST) {
            if (resultCode == cordova.getActivity().RESULT_OK) startVpnNow();
            else if (pendingCallback != null) fail(pendingCallback, "用户取消了 VPN 授权");
        }
    }

    private void startVpnNow() {
        try {
            if (pendingNode == null) throw new Exception("缺少节点信息");
            Intent i = new Intent(cordova.getActivity(), YulongVpnService.class);
            i.putExtra("host", pendingNode.optString("server", pendingNode.optString("host", "")));
            i.putExtra("port", pendingNode.optInt("port", 443));
            i.putExtra("name", pendingNode.optString("name", "节点"));
            if (Build.VERSION.SDK_INT >= 26) cordova.getActivity().startForegroundService(i); else cordova.getActivity().startService(i);
            if (pendingCallback != null) ok(pendingCallback, new JSONObject().put("ok", true).put("message", "已连接").put("node", pendingNode));
        } catch (Exception e) {
            if (pendingCallback != null) fail(pendingCallback, e.getMessage());
        }
    }

    private String request(String method, String path, JSONObject body) throws Exception {
        Exception last = null;
        for (String base : API_BASES) {
            try { return requestOne(base, method, path, body); }
            catch (Exception e) { last = e; }
        }
        throw new Exception("无法连接后台接口：" + (last == null ? "unknown" : last.getMessage()));
    }

    private String requestOne(String base, String method, String path, JSONObject body) throws Exception {
        URL url = new URL(base + path);
        HttpURLConnection c = (HttpURLConnection) url.openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(8000);
        c.setReadTimeout(22000);
        c.setRequestProperty("accept", "application/json");
        c.setRequestProperty("content-type", "application/json; charset=utf-8");
        c.setRequestProperty("user-agent", "YulongVPN-Cordova/1.0");
        if (body != null && !("GET".equalsIgnoreCase(method))) {
            c.setDoOutput(true);
            byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
            OutputStream os = c.getOutputStream(); os.write(bytes); os.flush(); os.close();
        }
        int code = c.getResponseCode();
        BufferedReader br = new BufferedReader(new InputStreamReader(code >= 400 ? c.getErrorStream() : c.getInputStream(), StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(); String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        if (code >= 500) throw new Exception("HTTP " + code);
        return sb.toString();
    }

    private void ok(CallbackContext cb, JSONObject json) {
        cb.sendPluginResult(new PluginResult(PluginResult.Status.OK, json));
    }
    private void fail(CallbackContext cb, String msg) {
        try { cb.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, new JSONObject().put("ok", false).put("message", msg == null ? "未知错误" : msg))); }
        catch (Exception e) { cb.error(msg); }
    }
}
