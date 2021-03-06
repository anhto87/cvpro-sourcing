<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [puppeteer](./puppeteer.md) &gt; [Page](./puppeteer.page.md) &gt; [cookies](./puppeteer.page.cookies.md)

## Page.cookies() method

If no URLs are specified, this method returns cookies for the current page URL. If URLs are specified, only cookies for those URLs are returned.

<b>Signature:</b>

```typescript
cookies(...urls: string[]): Promise<Protocol.Network.Cookie[]>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  urls | string\[\] |  |

<b>Returns:</b>

Promise&lt;Protocol.Network.Cookie\[\]&gt;

