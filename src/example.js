import React, { PureComponent } from "react";
import DataSheet from "react-datasheet";
import classNames from "classnames";

const SheetRenderer = (props) => {
  const {
    as: Tag,
    headerAs: Header,
    bodyAs: Body,
    rowAs: Row,
    cellAs: Cell,
    className,
    columns,
    selections,
    onSelectAllChanged,
  } = props;
  return (
    <Tag className={className}>
      <Header className="data-header">
        <Row>
          <Cell className="action-cell cell">
            <input
              type="checkbox"
              checked={selections.every((s) => s)}
              onChange={(e) => onSelectAllChanged(e.target.checked)}
            />
          </Cell>
          {columns.map((column) => (
            <Cell
              className="cell"
              style={{ width: column.width }}
              key={column.label}
            >
              {column.label}
            </Cell>
          ))}
        </Row>
      </Header>
      <Body className="data-body">{props.children}</Body>
    </Tag>
  );
};

const RowRenderer = (props) => {
  const {
    as: Tag,
    cellAs: Cell,
    className,
    row,
    selected,
    onSelectChanged,
  } = props;
  return (
    <Tag className={className}>
      <Cell className="action-cell cell">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectChanged(row, e.target.checked)}
        />
      </Cell>
      {props.children}
    </Tag>
  );
};

const CellRenderer = React.memo((props) => {
  console.log("RENDER cell");
  const {
    as: Tag,
    cell,
    row,
    col,
    columns,
    attributesRenderer,
    selected,
    editing,
    updated,
    style,
    ...rest
  } = props;

  // hey, how about some custom attributes on our cell?
  const attributes = cell.attributes || {};
  // ignore default style handed to us by the component and roll our own
  attributes.style = { width: columns[col].width };
  if (col === 0) {
    attributes.title = cell.label;
  }

  return (
    <Tag {...rest} {...attributes}>
      {props.children}
    </Tag>
  );
});

export default class OverrideEverythingSheet extends PureComponent {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSelectAllChanged = this.handleSelectAllChanged.bind(this);
    this.handleSelectChanged = this.handleSelectChanged.bind(this);
    this.handleCellsChanged = this.handleCellsChanged.bind(this);

    this.sheetRenderer = this.sheetRenderer.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.onSelect = this.onSelect.bind(this);

    this.state = {
      as: "table",
      columns: [
        { label: "2019", width: "30%" },
        { label: "2020", width: "20%" },
        { label: "2021", width: "20%" },
        { label: "2022", width: "20%" },
      ],
      grid: [
        [
          { value: "1" },
          { value: "2" },
          { value: "3" },
          { value: 4, attributes: { "data-foo": "bar" } },
        ],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
        [{ value: "1" }, { value: "2" }, { value: "3" }, { value: 4 }],
      ],
      selections: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    };
  }

  handleSelect(e) {
    this.setState({ as: e.target.value });
  }

  handleSelectAllChanged(selected) {
    const selections = this.state.selections.map((s) => selected);
    this.setState({ selections });
  }

  handleSelectChanged(index, selected) {
    const selections = [...this.state.selections];
    selections[index] = selected;
    this.setState({ selections });
  }

  onSelect(position) {
    const selection =
      position.start.i === position.end.i && position.start.j <= position.end.j
        ? {
            startIndex: position.start.j,
            cells: position.end.j - position.start.j + 1,
          }
        : null;
    this.setState({ selection });
  }

  handleCellsChanged(changes, additions) {
    const grid = this.state.grid;
    if (this.state.selection !== null && changes.length === 1) {
      new Array(this.state.selection.cells)
        .fill(changes[0])
        .forEach(({ cell, row, col, value }, index) => {
          grid[row][col + index] = { ...grid[row][col + index], value };
        });
    } else {
      changes.forEach(({ cell, row, col, value }) => {
        grid[row][col] = { ...grid[row][col], value };
      });
    }

    // paste extended beyond end, so add a new row
    additions &&
      additions.forEach(({ cell, row, col, value }) => {
        if (!grid[row]) {
          grid[row] = [
            { value: "" },
            { value: "" },
            { value: "" },
            { value: 0 },
          ];
        }
        if (grid[row][col]) {
          grid[row][col] = { ...grid[row][col], value };
        }
      });
    this.setState({ grid });
  }

  sheetRenderer(props) {
    const { columns, selections } = this.state;
    return (
      <SheetRenderer
        columns={columns}
        selections={selections}
        onSelectAllChanged={this.handleSelectAllChanged}
        as="table"
        headerAs="thead"
        bodyAs="tbody"
        rowAs="tr"
        cellAs="th"
        {...props}
      />
    );
  }

  rowRenderer(props) {
    const { selections } = this.state;
    return (
      <RowRenderer
        as="tr"
        cellAs="td"
        selected={selections[props.row]}
        onSelectChanged={this.handleSelectChanged}
        className="data-row"
        {...props}
      />
    );
  }

  cellRenderer(props) {
    const { editing, className } = props;
    const { selection } = this.state;
    let colSpan;
    let hideSiblings = false;
    if (editing && selection !== null) {
      hideSiblings = true;
      colSpan = selection.cells;
    }
    console.log(hideSiblings, colSpan);

    return (
      <CellRenderer
        as="td"
        columns={this.state.columns}
        editing={editing}
        {...props}
        colSpan={colSpan}
        className={classNames(className, hideSiblings && "hide-siblings")}
      />
    );
  }

  render() {
    return (
      <div>
        <DataSheet
          data={this.state.grid}
          className="custom-sheet"
          sheetRenderer={this.sheetRenderer}
          headerRenderer={this.headerRenderer}
          bodyRenderer={this.bodyRenderer}
          rowRenderer={this.rowRenderer}
          cellRenderer={this.cellRenderer}
          onCellsChanged={this.handleCellsChanged}
          valueRenderer={(cell) => cell.value}
          onSelect={this.onSelect}
        />
      </div>
    );
  }
}
