# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Mantiene la clase del Renderizador y su constructor para que ExoPlayer lo encuentre
-keep public class androidx.media3.decoder.ffmpeg.** { public *; }

# Mantiene todos los puentes nativos (JNI) intactos
-keepclasseswithmembernames class * { native <methods>; }

# Evita que ProGuard ofusque las librerías nativas de AndroidX
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**