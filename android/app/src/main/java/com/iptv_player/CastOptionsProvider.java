package com.iptv_player;

import com.google.android.gms.cast.framework.CastOptions;
import com.google.android.gms.cast.framework.OptionsProvider;
import com.google.android.gms.cast.framework.SessionProvider;
import com.google.android.gms.cast.framework.media.CastMediaOptions;
import com.google.android.gms.cast.framework.media.NotificationOptions;
import android.content.Context;
import java.util.List;

public class CastOptionsProvider implements OptionsProvider {
    @Override
    public CastOptions getCastOptions(Context context) {
        NotificationOptions notificationOptions = new NotificationOptions.Builder()
            .setTargetActivityClassName(MainActivity.class.getName())
            .build();
        CastMediaOptions mediaOptions = new CastMediaOptions.Builder()
            .setNotificationOptions(notificationOptions)
            .build();
        return new CastOptions.Builder()
            // ID de receptor por defecto
            .setReceiverApplicationId("CC1AD845") 
            .setCastMediaOptions(mediaOptions)
            .build();
    }

    @Override
    public List<SessionProvider> getAdditionalSessionProviders(Context context) {
        return null;
    }
}