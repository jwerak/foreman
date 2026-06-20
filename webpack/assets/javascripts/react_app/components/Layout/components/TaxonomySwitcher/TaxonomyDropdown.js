import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
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
import './TaxonomyDropdown.scss';

const TaxonomyDropdown = ({ taxonomyType, currentTaxonomy, taxonomies }) => {
  const id = `${taxonomyType}-dropdown`;
  const anyTaxonomyURL = foremanUrl(`/${taxonomyType}s/clear`);
  const manageTaxonomyURL = foremanUrl(`/${taxonomyType}s`);
  const anyTaxonomyText =
    taxonomyType === 'organization'
      ? __('Any organization')
      : __('Any location');

  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState(taxonomies);

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
          onClick={() => {
            window.location.assign(anyTaxonomyURL);
          }}
          isDisabled={!currentTaxonomy}
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
                window.location.assign(href);
              }
            }}
            isDisabled={title === currentTaxonomy}
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
