package cn.yulong.vpn;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.ProxyInfo;
import android.net.VpnService;
import android.os.Build;
import android.os.ParcelFileDescriptor;

public class YulongVpnService extends VpnService {
    public static final String ACTION_DISCONNECT = "cn.yulong.vpn.DISCONNECT";
    private ParcelFileDescriptor vpnInterface;

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_DISCONNECT.equals(intent.getAction())) {
            stopVpn();
            stopSelf();
            return START_NOT_STICKY;
        }
        String host = intent == null ? "" : intent.getStringExtra("host");
        int port = intent == null ? 443 : intent.getIntExtra("port", 443);
        String name = intent == null ? "玉龙VPN" : intent.getStringExtra("name");
        startVpn(host, port, name);
        return START_STICKY;
    }

    private void startVpn(String host, int port, String name) {
        try {
            stopVpn();
            Builder b = new Builder()
                    .setSession("玉龙VPN - " + name)
                    .addAddress("10.18.0.2", 32)
                    .addDnsServer("8.8.8.8")
                    .addDnsServer("1.1.1.1");
            if (Build.VERSION.SDK_INT >= 29 && host != null && host.length() > 0) {
                b.setHttpProxy(ProxyInfo.buildDirectProxy(host, port));
            }
            vpnInterface = b.establish();
            startForeground(18, notification(name, host + ":" + port));
        } catch (Exception e) {
            stopSelf();
        }
    }

    private Notification notification(String title, String text) {
        String channel = "yulong_vpn";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(channel, "玉龙VPN", NotificationManager.IMPORTANCE_LOW);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(c);
        }
        Intent i = new Intent(this, org.apache.cordova.CordovaActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, i, Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, channel) : new Notification.Builder(this);
        return b.setContentTitle("玉龙VPN 已连接").setContentText(title + " · " + text).setSmallIcon(android.R.drawable.stat_sys_download_done).setContentIntent(pi).build();
    }

    private void stopVpn() {
        try { if (vpnInterface != null) vpnInterface.close(); } catch (Exception ignored) {}
        vpnInterface = null;
        stopForeground(true);
    }

    @Override public void onDestroy() {
        stopVpn();
        super.onDestroy();
    }
}
