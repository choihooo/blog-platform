import type { TaxonomyCommands } from "../../features/taxonomy/model/contracts";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./taxonomy-actions";
export const taxonomyCommands: TaxonomyCommands = {
  create: createCategoryAction,
  update: updateCategoryAction,
  delete: deleteCategoryAction,
};
