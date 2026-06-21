import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  Icon,
  MenuToggle,
  SearchInput,
} from '@patternfly/react-core';
import { CheckIcon, GlobeIcon, BuildingIcon } from '@patternfly/react-icons';
import { foremanUrl } from '../../../../common/helpers';
import { translate as __ } from '../../../../common/I18n';
import { useForemanSetContext, useForemanSettings } from '../../../../Root/Context/ForemanContext';
import { updateTaxonomy } from '../../LayoutActions';
import { combineMenuItems } from '../../LayoutHelper';
import './TaxonomyDropdown.scss';

const switchTaxonomy = async (url, dispatch, setContext, displayNewHostsPage, history, location) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

  await fetch(url, {
    headers: {
      'X-SPA-Fetch': 'true',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'same-origin',
    redirect: 'manual',
  });

  const layoutResponse = await fetch(foremanUrl('/layout'), {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
  });

  if (!layoutResponse.ok) {
    window.location.reload();
    return;
  }

  const layoutData = await layoutResponse.json();

  dispatch(
    updateTaxonomy({
      items: combineMenuItems(layoutData, displayNewHostsPage),
      organization: layoutData.orgs.current_org,
      location: layoutData.locations.current_location,
    })
  );

  setContext(prev => ({
    ...prev,
    metadata: {
      ...prev.metadata,
      organization: layoutData.orgs.current_org
        ? { title: layoutData.orgs.current_org }
        : undefined,
      location: layoutData.locations.current_location
        ? { title: layoutData.locations.current_location }
        : undefined,
    },
  }));

  history.replace({
    pathname: location.pathname,
    search: location.search,
    state: { taxonomySwitch: Date.now() },
  });
};

const TaxonomyDropdown = ({ taxonomyType, currentTaxonomy, taxonomies }) => {
  const id = `${taxonomyType}-dropdown`;
  const anyTaxonomyURL = foremanUrl(`/${taxonomyType}s/clear`);
  const manageTaxonomyURL = foremanUrl(`/${taxonomyType}s`);
  const anyTaxonomyText =
    taxonomyType === 'organization'
      ? __('Any organization')
      : __('Any location');

  const dispatch = useDispatch();
  const setContext = useForemanSetContext();
  const settings = useForemanSettings();
  const displayNewHostsPage = settings?.displayNewHostsPage;
  const history = useHistory();
  const location = useLocation();

  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState(taxonomies);
  const [isSwitching, setIsSwitching] = useState(false);

  const onSearchButtonClick = useCallback(() => {
    const filtered =
      searchValue === ''
        ? taxonomies
        : taxonomies.filter(item =>
            item.title.toLowerCase().includes(searchValue.toLowerCase())
          );
    setFilteredItems(filtered || []);
  }, [searchValue, taxonomies]);

  useEffect(() => {
    onSearchButtonClick();
  }, [searchValue, onSearchButtonClick]);

  const handleTaxonomySwitch = useCallback(async (url) => {
    setIsSwitching(true);
    setIsOpen(false);
    try {
      await switchTaxonomy(url, dispatch, setContext, displayNewHostsPage, history, location);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Taxonomy switch failed:', err);
      window.location.reload();
    } finally {
      setIsSwitching(false);
    }
  }, [dispatch, setContext, displayNewHostsPage, history, location]);

  const onSelect = () => {
    setIsOpen(false);
  };

  const selectedIcon = (
    <Icon size="sm" className="current-taxonomy-v">
      <CheckIcon />
    </Icon>
  );
  const anyIcon = (
    <Icon style={{ marginRight: '5px', marginTop: '3px' }}>
      {taxonomyType === 'organization' ? <BuildingIcon /> : <GlobeIcon />}
    </Icon>
  );

  return (
    <Dropdown
      id={id}
      className="context-selector"
      isOpen={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) setSearchValue('');
      }}
      onSelect={onSelect}
      toggle={toggleRef => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen(prev => !prev)}
          isExpanded={isOpen}
          isFullWidth
          isDisabled={isSwitching}
          aria-label="Selected Taxonomy:"
          ouiaId={`taxonomy-context-selector-${taxonomyType}`}
        >
          {currentTaxonomy || (
            <>
              {anyIcon}
              {anyTaxonomyText}
            </>
          )}
        </MenuToggle>
      )}
    >
      <SearchInput
        value={searchValue}
        onChange={(_event, val) => setSearchValue(val)}
        onClear={() => setSearchValue('')}
        aria-label="Filter taxonomies"
      />
      <Divider />
      <DropdownList>
        <DropdownItem
          key={0}
          className={`${taxonomyType}s_clear`}
          onClick={() => handleTaxonomySwitch(anyTaxonomyURL)}
          isDisabled={!currentTaxonomy || isSwitching}
        >
          <Grid hasGutter>
            <GridItem span={1}>{anyIcon}</GridItem>
            <GridItem span={9} style={{ textAlign: 'left' }}>
              {anyTaxonomyText}
            </GridItem>
            <GridItem span={2}>{!currentTaxonomy && selectedIcon}</GridItem>
          </Grid>
        </DropdownItem>
        {filteredItems.map(({ title, href }, i) => (
          <DropdownItem
            key={i + 1}
            id={`select_taxonomy_${title}`}
            className={`${taxonomyType}_menuitem`}
            onClick={() => {
              if (href) {
                handleTaxonomySwitch(href);
              }
            }}
            isDisabled={title === currentTaxonomy || isSwitching}
          >
            <Grid hasGutter>
              <GridItem span={11} style={{ textAlign: 'left' }}>
                {title}
              </GridItem>
              <GridItem span={1}>
                {title === currentTaxonomy && selectedIcon}
              </GridItem>
            </Grid>
          </DropdownItem>
        ))}
        <Divider key="separator" />
        <DropdownItem
          key="manage"
          component="a"
          href={manageTaxonomyURL}
        >
          <Button
            ouiaId={`manage-taxonomy-button-${taxonomyType}`}
            size="sm"
            component="span"
            className={taxonomyType}
            variant="secondary"
          >
            {taxonomyType === 'organization'
              ? __('Manage Organizations')
              : __('Manage Locations')}
          </Button>
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

TaxonomyDropdown.propTypes = {
  taxonomyType: PropTypes.oneOf(['organization', 'location']).isRequired,
  currentTaxonomy: PropTypes.string,
  taxonomies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
};

TaxonomyDropdown.defaultProps = {
  currentTaxonomy: undefined,
};

export default TaxonomyDropdown;
