import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner } from '@patternfly/react-core';
import axios from 'axios';

const updateCsrfToken = html => {
  const match = html.match(
    /<meta[^>]+name="csrf-token"[^>]+content="([^"]*)"[^>]*>/
  );
  if (match) {
    const token = match[1];
    const existing = document.querySelector('meta[name="csrf-token"]');
    if (existing) {
      existing.content = token;
    } else {
      const meta = document.createElement('meta');
      meta.name = 'csrf-token';
      meta.content = token;
      document.head.appendChild(meta);
    }
    axios.defaults.headers.common['X-CSRF-Token'] = token;
  }
};

const updateTitle = container => {
  const title = container.getAttribute('data-title');
  if (title) {
    document.title = `${title} - Foreman`;
  }
};

const executeScripts = container => {
  const scripts = container.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    );
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
};

const unmountReactComponents = containerRef => {
  if (!containerRef.current) return;
  const components = containerRef.current.querySelectorAll(
    'foreman-react-component'
  );
  components.forEach(comp => {
    if (comp._reactRoot) {
      comp._reactRoot.unmount();
      comp._reactRoot = null;
    }
  });
};

const RailsPage = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialLoadDone = useRef(false);

  const adoptExistingContent = useCallback(() => {
    const railsContent = document.getElementById('rails-app-content');
    if (railsContent && containerRef.current) {
      while (railsContent.firstChild) {
        containerRef.current.appendChild(railsContent.firstChild);
      }
      railsContent.remove();
      initialLoadDone.current = true;
      return true;
    }
    return false;
  }, []);

  const fetchContent = useCallback(
    async url => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            'X-SPA-Fetch': 'true',
            Accept: 'text/html',
            'X-CSRF-Token':
              document.querySelector('meta[name="csrf-token"]')?.content || '',
          },
          credentials: 'same-origin',
        });

        if (response.redirected) {
          const redirectUrl = new URL(response.url);
          window.history.replaceState(
            null,
            '',
            redirectUrl.pathname + redirectUrl.search
          );
        }

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        updateCsrfToken(html);

        if (!containerRef.current) return;

        unmountReactComponents(containerRef);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const spaContent = doc.getElementById('spa-content');

        if (spaContent) {
          updateTitle(spaContent);
          containerRef.current.innerHTML = '';
          while (spaContent.firstChild) {
            containerRef.current.appendChild(
              document.adoptNode(spaContent.firstChild)
            );
          }
          executeScripts(containerRef.current);
        } else {
          containerRef.current.innerHTML = html;
          executeScripts(containerRef.current);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const taxonomyKey = location.state?.taxonomySwitch;

  useEffect(() => {
    document.body.classList.remove('react-page');

    if (!initialLoadDone.current && adoptExistingContent()) {
      return;
    }

    initialLoadDone.current = true;
    const url = `${location.pathname}${location.search}`;
    fetchContent(url);

    return () => {
      unmountReactComponents(containerRef);
    };
  }, [location.pathname, location.search, taxonomyKey, adoptExistingContent, fetchContent]);

  return (
    <>
      {isLoading && (
        <div className="pf-v6-c-page__main-section" style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <Spinner size="xl" aria-label="Loading page content" />
        </div>
      )}
      {error && (
        <div className="pf-v6-c-page__main-section">
          <div className="pf-v6-c-alert pf-m-danger pf-m-inline">
            <div className="pf-v6-c-alert__title">Failed to load page: {error}</div>
          </div>
        </div>
      )}
      <div ref={containerRef} style={isLoading ? { display: 'none' } : undefined} />
    </>
  );
};

export default RailsPage;
