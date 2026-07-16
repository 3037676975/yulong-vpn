import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const RELEASE_API = 'https://api.github.com/repos/3037676975/chatgptVPN/releases/tags/chatgptvpn-latest';
const ASSET_NAME = 'ChatGPTVPN-v1.apk';

export async function GET() {
  try {
    const releaseResponse = await fetch(RELEASE_API, {
      cache: 'no-store',
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'SmileChat-ChatGPTVPN-Downloader'
      }
    });

    if (!releaseResponse.ok) {
      return NextResponse.json({
        ok: false,
        building: true,
        message: '最新版 APK 正在构建，请稍后刷新。'
      }, {
        status: 503,
        headers: { 'cache-control': 'no-store' }
      });
    }

    const release = await releaseResponse.json();
    const asset = Array.isArray(release.assets)
      ? release.assets.find(item => item?.name === ASSET_NAME)
      : null;

    if (!asset?.browser_download_url) {
      return NextResponse.json({
        ok: false,
        building: true,
        message: 'APK 已发布但文件仍在上传，请稍后刷新。'
      }, {
        status: 503,
        headers: { 'cache-control': 'no-store' }
      });
    }

    const apkResponse = await fetch(asset.browser_download_url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { 'user-agent': 'SmileChat-ChatGPTVPN-Downloader' }
    });

    if (!apkResponse.ok || !apkResponse.body) {
      return NextResponse.json({
        ok: false,
        message: 'APK 下载源暂时不可用，请稍后重试。'
      }, {
        status: 502,
        headers: { 'cache-control': 'no-store' }
      });
    }

    return new Response(apkResponse.body, {
      status: 200,
      headers: {
        'content-type': 'application/vnd.android.package-archive',
        'content-disposition': `attachment; filename="${ASSET_NAME}"`,
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: '下载服务暂时不可用，请稍后重试。'
    }, {
      status: 500,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
