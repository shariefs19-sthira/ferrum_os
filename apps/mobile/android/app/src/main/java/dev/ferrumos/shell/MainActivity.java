package dev.ferrumos.shell;

import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        if (!hasNetwork()) {
            startActivity(new Intent(this, OfflineActivity.class));
            finish();
            return;
        }
        super.onCreate(savedInstanceState);
    }

    private boolean hasNetwork() {
        ConnectivityManager connectivity =
                (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivity == null) return false;
        Network activeNetwork = connectivity.getActiveNetwork();
        return activeNetwork != null;
    }
}
