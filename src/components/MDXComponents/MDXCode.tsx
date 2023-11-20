import { useId, useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism, Highlight } from 'prism-react-renderer';
import { theme } from './code-theme';
import { Button, Flex, View, VisuallyHidden } from '@aws-amplify/ui-react';
import { versions } from '@/constants/versions';
import { trackCopyClicks } from '@/utils/track';
(typeof global !== 'undefined' ? global : window).Prism = Prism;
require('prismjs/components/prism-java');
require('prismjs/components/prism-dart');
require('prismjs/components/prism-diff');

require('./cli-error-language.js');

const addVersions = (code: string) => {
  code = code.replace(/ANDROID_VERSION/g, versions.ANDROID_VERSION);
  code = code.replace(/ANDROID_DEVPREVIEW/g, versions.ANDROID_DEVPREVIEW);
  code = code.replace(/ANDROID_V1_VERSION/g, versions.ANDROID_V1_VERSION);
  code = code.replace(
    /ANDROID_V1_GEO_VERSION/g,
    versions.ANDROID_V1_GEO_VERSION
  );
  code = code.replace(
    /ANDROID_V1_KOTLIN_VERSION/g,
    versions.ANDROID_V1_KOTLIN_VERSION
  );
  code = code.replace(/ANDROID_SDK_VERSION/g, versions.ANDROID_SDK_VERSION);
  code = code.replace(/KOTLIN_SDK_VERSION/g, versions.KOTLIN_SDK_VERSION);
  return code;
};

export const MDXCode = (props) => {
  const {
    codeString,
    language = 'js',
    fileName,
    showLineNumbers = true
  } = props;

  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState(codeString);
  const shouldShowCopy = language !== 'console';
  const shouldShowHeader = shouldShowCopy || fileName;
  const fileNameId = useId();
  const codeId = useId();

  const copy = () => {
    trackCopyClicks(codeString);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    setCode(addVersions(codeString));
  }, []);

  return (
    <Highlight theme={theme} code={code} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <View>
          <div style={{ display: 'none' }}>
            {/* searchable code \ */}
            {codeString}
          </div>
          <View className="pre-wrapper">
            {shouldShowHeader ? (
              <Flex className="pre-header">
                {fileName ? (
                  <View className="pre-filename" id={fileNameId}>
                    {fileName}
                  </View>
                ) : null}
                {shouldShowCopy ? (
                  <CopyToClipboard text={codeString} onCopy={copy}>
                    <Button
                      size="small"
                      variation="link"
                      disabled={copied}
                      className="code-copy"
                    >
                      <VisuallyHidden>Copy example code</VisuallyHidden>
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </CopyToClipboard>
                ) : null}
              </Flex>
            ) : null}

            <pre
              style={style}
              tabIndex={0}
              aria-labelledby={`${fileName ? fileNameId : null} ${codeId}`}
              className={`pre${shouldShowHeader ? ' pre--header' : ''}`}
            >
              <code className="pre-code" id={codeId}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {showLineNumbers && (
                      <span className="line-number">{i + 1}</span>
                    )}
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          </View>
        </View>
      )}
    </Highlight>
  );
};
