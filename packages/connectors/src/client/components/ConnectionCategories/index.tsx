import styled from "styled-components";

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${getHomeTheme("CategoriesContainer")}
`;

export const ConnectionCategories = () => {
  return (
    <CategoriesContainer>
      {categories?.map((category) => (
        <Category
          key={`category-${category.name}`}
          name={category.name}
          containers={category.items.map(
            ({ name, link, icon, state, children, status, connectorType }) => {
              return {
                key: name,
                text: name,
                link: link ?? undefined,
                icon,
                connectorType,
                state: statesToStatus([
                  state,
                  ...children.map((child) => child.state),
                ]),
                status: status ? toTitleCase(status) : undefined,
                children: children.map(
                  ({ name, icon, state, status, connectorType }) => ({
                    key: name,
                    connectorType,
                    icon,
                    text: name,
                    status: status ? toTitleCase(status) : undefined,
                    state: statesToStatus([state]),
                  })
                ),
              };
            }
          )}
        />
      ))}
    </CategoriesContainer>
  );
};
